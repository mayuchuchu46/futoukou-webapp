import { NextResponse } from 'next/server';
import { getCurrentMember } from '@/lib/memberAuth';
import { isSubscriptionActive } from '@/lib/membership';
import { getOrGenerateMemberSummary } from '@/lib/memberSummary';

// マイページの「今のお子さんの状況」AIサマリー用エンドポイント。動的なRoute Handlerなので、
// ここでCookieから会員情報を読んでも共有キャッシュ汚染の心配はない（lib/consultations.tsのコメント参照）。
//
// status_summary（状況の整理）は、会員登録済みで相談履歴があれば誰でも見られる無料の
// お試し表示。advice（次の一手のアドバイス）・phrasing_suggestion（言葉かけの提案）・
// environment_suggestion（環境面の工夫の提案）・school_fit_points（学校選びの着眼点）は、
// 当初は読み放題会員（有料）だけのフル機能にしていたが、2026-10-12の方針変更で、
// 今の段階ではここを無料会員（ログインしているだけ）にも開放し、ノートの中身が増えて
// 詳しくなっていく体験そのものをまず知ってもらう方針にした。
// 将来的には、相談（＝ノートの材料）が一定件数を超えて分析が詳しくなった先は
// 有料会員限定にする、という課金導線をここに追加する想定（未実装。現状はactiveに
// かかわらず常にlocked:falseで全部開放している）。
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
      advice: result.advice,
      phrasingSuggestion: result.phrasingSuggestion,
      environmentSuggestion: result.environmentSuggestion,
      schoolFitPoints: result.schoolFitPoints,
      locked: false,
    },
  });
}
