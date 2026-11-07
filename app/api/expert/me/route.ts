import { NextResponse } from 'next/server';
import { getCurrentExpert } from '@/lib/expertAuth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { SENPAI_CREDENTIAL } from '@/lib/config';

// Header.tsxが「ログイン中の専門家・経験者向けに、未回答の質問が何件あるか」を
// すぐチェックできるタブを出すための軽量エンドポイント（2026-10-31追加、「TOPの
// アカウントの箇所くらいにわかりやすく出せるといい」「何件自分に質問が来てるとか
// そういうのもすぐチェックできるように」との依頼を受けて）。
// 2026-11-01、専門家への質問を恒久的に無料化したのに伴い、経験者をこのキューから
// 除外する理由（価格体系・報酬の違い）自体がなくなったため、常に含める。
export async function GET() {
  const expert = await getCurrentExpert();
  if (!expert) {
    return NextResponse.json({ loggedIn: false });
  }
  if (!expert.verified) {
    return NextResponse.json({ loggedIn: true, verified: false, pendingCount: 0 });
  }

  const isSenpai = expert.credential === SENPAI_CREDENTIAL;

  const supabase = getSupabaseAdmin();
  const { data: pendingRows } = await supabase
    .from('consultations')
    .select('id')
    .eq('request_type', 'expert')
    .eq('paid', true)
    .eq('expert_status', 'pending')
    .or(`requested_expert_id.is.null,requested_expert_id.eq.${expert.id}`);

  // 2026-11-07、「あとで見る」に退避した相談はヘッダーのバッジ件数にも含めない
  // ようにする（アカウントページ側の「回答待ちの相談」バッジは退避分を除いた
  // 未確認件数で表示しているのに、こちらのヘッダーバッジだけ退避前の総数の
  // ままだったため、「あとで見るにしまっても数字が減らない」ように見えていた）。
  const { data: deferredRows } = await supabase
    .from('expert_consultation_reviews')
    .select('consultation_id')
    .eq('expert_id', expert.id);
  const deferredIds = new Set((deferredRows || []).map((r) => r.consultation_id));
  const pendingCount = (pendingRows || []).filter((r) => !deferredIds.has(r.id)).length;

  return NextResponse.json({ loggedIn: true, verified: true, pendingCount, isSenpai });
}
