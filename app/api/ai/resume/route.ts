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

function buildResumePrompt(resumeText: string, focusArea?: string): string {
  return `You are a senior technical recruiter and career coach with 15 years of experience helping developers land roles at top companies.

Analyze the following developer resume${focusArea ? ` for ${focusArea} roles` : ''}.

Respond in clean, plain text without emojis or decorative formatting. Use simple headings and bullet points with these exact sections:

Strengths
List 4-6 specific strengths with brief explanations. Be concrete, not generic.

Issues & Weaknesses
Identify problems: vague descriptions, missing metrics, weak action verbs, ATS-unfriendly formatting, skill gaps for target role.

Improvement Suggestions
Give 5-7 actionable rewrites. Use before/after format where possible. Be specific.

Score: X/10
One sentence justification.

Interview Questions (8 questions)
Generate targeted questions likely asked for this background. Label each as [Behavioral] or [Technical] and include what the interviewer is assessing.

---
RESUME:
${resumeText}`;
}

export async function POST(req: NextRequest) {
  // 1. Auth check
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Rate limit check via Redis
  const { allowed, remaining } = await checkRateLimit(session.user.id, 'resume');
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again in a minute.', remaining: 0 },
      { status: 429 }
    );
  }

  // 3. Parse & validate body
  const body = await req.json();
  const { resumeText, focusArea } = body;
  if (!resumeText) {
    return NextResponse.json({ error: 'Resume text is required' }, { status: 400 });
  }

  // 4. Build prompt
  const prompt = buildResumePrompt(resumeText, focusArea);

  // 5. Connect to MongoDB, then stream Gemini response
  await connectDB();
  let fullResponse = '';
  const stream = await streamGeminiResponseWithRetry(prompt);

  const transformStream = new TransformStream({
    transform(chunk, controller) {
      fullResponse += chunk;
      controller.enqueue(new TextEncoder().encode(chunk));
    },
    async flush() {
      // 6. Save to MongoDB History collection after stream completes
      await History.create({
        userId: session.user.id,
        tool: 'resume',
        input: { resumeText: resumeText.slice(0, 500), focusArea },
        output: fullResponse,
      });

      // 7. Increment usage counter on User document
      await User.findByIdAndUpdate(session.user.id, { $inc: { usageCount: 1 } });
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
