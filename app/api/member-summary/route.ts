import { NextResponse } from 'next/server';
import { getCurrentMember } from '@/lib/memberAuth';
import { isSubscriptionActive } from '@/lib/membership';
import { getOrGenerateMemberSummary } from '@/lib/memberSummary';

// マイページの「今のお子さんの状況」AIサマリー用エンドポイント。動的なRoute Handlerなので、
// ここでCookieから会員情報を読んでも共有キャッシュ汚染の心配はない（lib/consultations.tsのコメント参照）。
//
// status_summary（状況の整理）は、会員登録済みで相談履歴があれば誰でも見られる無料の
// お試し表示。advice（次の一手のアドバイス）・phrasing_suggestion（言葉かけの提案）・
// environment_suggestion（環境面の工夫の提案）は、読み放題会員だけのフル機能とし、
// 新たな課金を増やさず既存の会員特典に統合する。非会員にはこれらをlockedとして伏せる。
export async function GET() {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json({ loggedIn: false, active: false, count: 0, summary: null });
  }

  const active = isSubscriptionActive(member);
  const result = await getOrGenerateMemberSummary(member.id);

  if (!result) {
    return NextResponse.json({ loggedIn: true, active, count: 0, summary: null });
  }

  return NextResponse.json({
    loggedIn: true,
    active,
    count: result.consultationCount,
    summary: {
      statusSummary: result.statusSummary,
      advice: active ? result.advice : null,
      phrasingSuggestion: active ? result.phrasingSuggestion : null,
      environmentSuggestion: active ? result.environmentSuggestion : null,
      locked: !active,
    },
  });
}
