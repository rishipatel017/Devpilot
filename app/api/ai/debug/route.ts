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

function buildDebugPrompt(error: string, code: string, language: string): string {
  return `You are a ${language} debugging expert. A developer is stuck on this error and needs clear, actionable help.

ERROR / STACK TRACE:
\`\`\`
${error}
\`\`\`
${code ? `\nCODE CONTEXT:\n\`\`\`\n${code}\n\`\`\`` : ''}

Respond in clean, plain text without emojis or decorative formatting. Use simple headings and bullet points.

What Went Wrong
Explain the error in plain English. What is failing and what does the error message actually mean?

Root Cause
The underlying reason — not just the symptom. Why does this happen in ${language}?

The Fix
Show corrected code. If they provided code, fix theirs specifically. Explain each change.

Prevention
Best practices, patterns, or tools to prevent this class of error in future.

Related Pitfalls
1-2 related errors or edge cases they should also watch for.`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { allowed, remaining } = await checkRateLimit(session.user.id, 'debug');
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again in a minute.', remaining: 0 },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { error, code, language } = body;
  if (!error) {
    return NextResponse.json({ error: 'Error message is required' }, { status: 400 });
  }

  const prompt = buildDebugPrompt(error, code, language || 'JavaScript');

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
        tool: 'debug',
        input: { error: error.slice(0, 300), code: code?.slice(0, 500), language },
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
