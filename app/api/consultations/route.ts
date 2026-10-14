import { NextRequest, NextResponse } from 'next/server';
import { ConsultationSort, getConsultationsList } from '@/lib/consultations';
import { getCurrentMember } from '@/lib/memberAuth';
import { isSubscriptionActive } from '@/lib/membership';

// この route はクライアント側からの fetch 経由でのみ呼ばれる動的な Route Handler
// （ページのSSRシェルとして共有キャッシュに乗ることはない）ため、ここでログイン中の
// 会員のサブスク状態をCookieから判定して良い（lib/consultations.ts のコメント参照）。
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category');
  const q = req.nextUrl.searchParams.get('q');
  const viewerId = req.nextUrl.searchParams.get('viewer_id');
  const authorId = req.nextUrl.searchParams.get('author_id');
  const expertAnswered = req.nextUrl.searchParams.get('expert_answered') === '1';
  // 並び替え（2026-10-15追加）。不正な値が来た場合は既定の新着順にフォールバックする。
  const sortParam = req.nextUrl.searchParams.get('sort');
  const sort: ConsultationSort = sortParam === 'views' || sortParam === 'likes' ? sortParam : 'new';

  const member = await getCurrentMember();
  const memberActive = isSubscriptionActive(member);

  const consultations = await getConsultationsList({
    category,
    q,
    viewerId,
    authorId,
    expertAnswered,
    memberActive,
    memberId: member?.id || null,
    sort,
  });

  return NextResponse.json({ consultations });
}
