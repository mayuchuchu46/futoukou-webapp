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
  const { count } = await supabase
    .from('consultations')
    .select('id', { count: 'exact', head: true })
    .eq('request_type', 'expert')
    .eq('paid', true)
    .eq('expert_status', 'pending')
    .or(`requested_expert_id.is.null,requested_expert_id.eq.${expert.id}`);

  return NextResponse.json({ loggedIn: true, verified: true, pendingCount: count || 0, isSenpai });
}
