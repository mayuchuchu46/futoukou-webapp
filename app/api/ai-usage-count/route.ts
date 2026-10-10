import { NextRequest, NextResponse } from 'next/server';
import { countAiConsultationsAllTime } from '@/lib/rateLimit';
import { AI_USAGE_UPSELL_THRESHOLD } from '@/lib/config';

// 利用者（author_id）が無料AI相談を累計で何回使ったか。
// 専門家への相談（有料）を案内するバナーの表示判定に使う。
export async function GET(req: NextRequest) {
  const authorId = req.nextUrl.searchParams.get('author_id');
  if (!authorId) {
    return NextResponse.json({ error: 'author_id is required' }, { status: 400 });
  }

  const count = await countAiConsultationsAllTime(authorId);
  return NextResponse.json({ count, threshold: AI_USAGE_UPSELL_THRESHOLD });
}
