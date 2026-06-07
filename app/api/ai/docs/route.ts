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

function buildDocsPrompt(code: string, style: string): string {
  return `You are a senior technical writer and developer documentation expert.

Generate professional ${style} documentation for the following code. Make it thorough, accurate, and production-ready.

CODE:
\`\`\`
${code}
\`\`\`

Respond in clean, plain text without emojis or decorative formatting. Use simple headings and bullet points.

Overview
What this code does in 1-3 sentences. Purpose and context.

${style} Documentation
The complete documentation in the exact ${style} format. Include:
- All parameters with types and descriptions
- Return value with type
- Throws / exceptions (if any)
- Usage examples (2-3 realistic scenarios)

Edge Cases & Important Notes
Limitations, gotchas, null/undefined behavior, performance considerations.

See Also
Related functions, modules, or documentation links (infer from context).`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { allowed, remaining } = await checkRateLimit(session.user.id, 'docs');
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again in a minute.', remaining: 0 },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { code, style } = body;
  if (!code) {
    return NextResponse.json({ error: 'Code is required' }, { status: 400 });
  }

  const prompt = buildDocsPrompt(code, style || 'JSDoc');

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
        tool: 'docs',
        input: { code: code.slice(0, 500), style },
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
