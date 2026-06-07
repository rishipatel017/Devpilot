import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import { History } from '@/models/History';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const tool = searchParams.get('tool');
  const limit = parseInt(searchParams.get('limit') || '20');

  await connectDB();

  const query: any = { userId: session.user.id };
  if (tool) {
    query.tool = tool;
  }

  const history = await History.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return NextResponse.json({ history });
}
