import { NextResponse } from 'next/server';
import { getCurrentExpert } from '@/lib/expertAuth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { SENPAI_CREDENTIAL, EXPERT_VOLUNTEER_MODE } from '@/lib/config';

// Header.tsxが「ログイン中の専門家・先輩保護者向けに、未回答の質問が何件あるか」を
// すぐチェックできるタブを出すための軽量エンドポイント（2026-10-31追加、「TOPの
// アカウントの箇所くらいにわかりやすく出せるといい」「何件自分に質問が来てるとか
// そういうのもすぐチェックできるように」との依頼を受けて）。
// app/expert/dashboard/page.tsxの未回答一覧取得と同じ条件（先輩保護者は通常運用中は
// 専門家向けキューの対象外、EXPERT_VOLUNTEER_MODE中のみ含める）をここでも揃える。
export async function GET() {
  const expert = await getCurrentExpert();
  if (!expert) {
    return NextResponse.json({ loggedIn: false });
  }
  if (!expert.verified) {
    return NextResponse.json({ loggedIn: true, verified: false, pendingCount: 0 });
  }

  const isSenpai = expert.credential === SENPAI_CREDENTIAL;
  const excludeSenpai = isSenpai && !EXPERT_VOLUNTEER_MODE;
  if (excludeSenpai) {
    return NextResponse.json({ loggedIn: true, verified: true, pendingCount: 0, isSenpai: true });
  }

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
