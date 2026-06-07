import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { checkRateLimit } from '@/lib/rate-limit';
import { streamGeminiResponseWithRetry } from '@/lib/gemini';
import { connectDB } from '@/lib/mongodb';
import { History } from '@/models/History';
import { User } from '@/models/User';
import redis from '@/lib/redis';
import crypto from 'crypto';

function buildSqlPrompt(request: string, schema: string, dialect: string): string {
  return `You are a senior database engineer and SQL expert specializing in ${dialect} with deep knowledge of query optimization.

Convert this plain-English request into a production-ready ${dialect} SQL query.

REQUEST: ${request}
${schema ? `\nSCHEMA:\n\`\`\`\n${schema}\n\`\`\`` : ''}

Respond in clean, plain text without emojis or decorative formatting. Use simple headings and bullet points.

SQL Query
\`\`\`sql
-- Well-formatted, production-ready query
\`\`\`

Query Breakdown
Explain each clause (SELECT, FROM, JOIN, WHERE, GROUP BY, etc.) in plain English. Why is each part needed?

Performance & Indexing
- Suggested indexes for this query
- Potential N+1 or full-table-scan risks
- Estimated complexity

Variations
2 alternative approaches:
1. With pagination (LIMIT/OFFSET or cursor-based)
2. A simplified or more performant version for large datasets`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { allowed, remaining } = await checkRateLimit(session.user.id, 'sql');
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again in a minute.', remaining: 0 },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { request, schema, dialect } = body;
  if (!request) {
    return NextResponse.json({ error: 'Request is required' }, { status: 400 });
  }

  const prompt = buildSqlPrompt(request, schema, dialect || 'PostgreSQL');

  const cacheKey = `cache:${crypto.createHash('sha256').update(prompt).digest('hex')}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return new NextResponse(cached, {
      headers: { 'Content-Type': 'text/plain', 'X-Cache': 'HIT' },
    });
  }

  await connectDB();
  let fullResponse = '';
  const stream = await streamGeminiResponseWithRetry(prompt);

  const transformStream = new TransformStream({
    transform(chunk, controller) {
      fullResponse += chunk;
      controller.enqueue(new TextEncoder().encode(chunk));
    },
    async flush() {
      await History.create({
        userId: session.user.id,
        tool: 'sql',
        input: { request: request.slice(0, 300), schema: schema?.slice(0, 500), dialect },
        output: fullResponse,
      });
      await User.findByIdAndUpdate(session.user.id, { $inc: { usageCount: 1 } });
      await redis.setex(cacheKey, 3600, fullResponse);
    },
  });

  return new NextResponse(stream.pipeThrough(transformStream), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-RateLimit-Remaining': remaining.toString(),
      'Transfer-Encoding': 'chunked',
    },
  });
}
