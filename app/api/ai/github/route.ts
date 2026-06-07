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
import { fetchGitHubRepoContent, parseGitHubUrl } from '@/lib/github-api';

function buildGithubPrompt(repoContent: any, description: string, level: string): string {
  const { readme, packageJson, fileTree } = repoContent;

  return `You are a senior software architect who excels at making complex codebases approachable.

Analyze this GitHub repository at the "${level}" comprehension level using ONLY the provided content below.
${description ? `Additional context provided: ${description}` : ''}

Do not assume or invent anything that is not present in the provided content. If information is missing, state that it's not available.

Repository Content:

${readme ? `README:\n${readme}\n\n` : 'No README available.\n\n'}
${packageJson ? `package.json:\n${packageJson}\n\n` : ''}
${fileTree ? `File Structure:\n${fileTree}\n\n` : ''}

Respond in clean, plain text without emojis or decorative formatting. Use simple headings and bullet points.

What This Project Does
2-3 sentences based on the README and package.json. What problem does it solve? Who uses it?

Architecture Overview
How is the code organized based on the file structure? What are the main layers (frontend/backend/infra)?

Tech Stack
List the key technologies from package.json and README with their roles and why they're used.

Key Components
Walk through the most important files/modules visible in the file structure and what they likely do.

Getting Started
Step-by-step local setup guide based on the README and package.json scripts.

Notable Design Decisions
2-3 architectural or implementation choices worth learning from based on the code structure.`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { allowed, remaining } = await checkRateLimit(session.user.id, 'github');
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again in a minute.', remaining: 0 },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { repoUrl, description, level } = body;
  if (!repoUrl) {
    return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 });
  }

  // Parse GitHub URL and fetch actual repository content
  const parsedUrl = parseGitHubUrl(repoUrl);
  if (!parsedUrl) {
    return NextResponse.json({ error: 'Invalid GitHub repository URL' }, { status: 400 });
  }

  let repoContent;
  try {
    repoContent = await fetchGitHubRepoContent(
      parsedUrl.owner,
      parsedUrl.repo,
      process.env.GITHUB_TOKEN
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch repository content. The repository may be private or the URL may be invalid.' },
      { status: 400 }
    );
  }

  const prompt = buildGithubPrompt(repoContent, description, level || 'intermediate');

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
        tool: 'github',
        input: { repoUrl, description: description?.slice(0, 200), level },
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
