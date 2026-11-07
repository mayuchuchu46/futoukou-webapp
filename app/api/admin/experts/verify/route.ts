import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { expertPayout } from '@/lib/config';
import { sendEmail } from '@/lib/email';
import { expertDisplayName, answererName } from '@/lib/expertDisplay';
import { SITE_URL, SITE_NAME } from '@/lib/site';

// 審査アクション。approve以外はnoteを本人にダッシュボードで見せる前提
// （2026-10-13、承認だけでなく「差し戻し」「却下」も扱えるように拡張）。
// 後方互換：古い呼び出し（{ expert_id, verified: true/false }）も approve/pendingに戻す
// 扱いとして引き続き受け付ける。
type Action = 'approve' | 'needs_fix' | 'reject';

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '管理者ログインが必要です' }, { status: 401 });
  }
  const body = await req.json();
  const { expert_id, note } = body as { expert_id?: string; note?: string };
  if (!expert_id) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  // action優先。無ければ旧形式のverifiedから推測する。
  let action: Action | 'pending';
  if (body.action === 'approve' || body.action === 'needs_fix' || body.action === 'reject') {
    action = body.action;
  } else if ('verified' in body) {
    action = body.verified ? 'approve' : 'pending'; // falseに戻す＝審査待ちに戻す（旧UIの「取り消し」用）
  } else {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  // verified_atは登録証（本人確認書類）の保管期限の起点（lib/expertLicenseDoc.ts）。
  // 承認した時刻のみ記録し、それ以外の状態に移るときはクリアする。
  const update =
    action === 'approve'
      ? { verified: true, verified_at: new Date().toISOString(), review_status: 'verified', review_note: null }
      : action === 'needs_fix'
        ? { verified: false, verified_at: null, review_status: 'needs_fix', review_note: note || null }
        : action === 'reject'
          ? { verified: false, verified_at: null, review_status: 'rejected', review_note: note || null }
          : { verified: false, verified_at: null, review_status: 'pending', review_note: null };

  const { error } = await supabase.from('experts').update(update).eq('id', expert_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 承認（approve）の場合、公開側の結果ページでその場で書いてもらった回答
  // （expert_pending_answers）があれば、このタイミングでまとめて公開する
  // （2026-11-07追加。/api/expert/public-answer参照）。承認前に書かれた回答は
  // 本人確認が済むまで非公開のため、ここが唯一の公開タイミングになる。
  if (action === 'approve') {
    const { data: pendingAnswers } = await supabase
      .from('expert_pending_answers')
      .select('id, consultation_id, answer')
      .eq('expert_id', expert_id);

    for (const pending of pendingAnswers || []) {
      // 承認を待つ間に、別の専門家・経験者が先にこの相談へ回答済みだったり、
      // 相談自体が非表示化されている可能性があるため、公開直前にもう一度状態を確認する。
      const { data: consultation } = await supabase
        .from('consultations')
        .select('id, hidden, expert_status, expert_funding, price_jpy, member_id, question')
        .eq('id', pending.consultation_id)
        .single();

      if (!consultation || consultation.hidden || consultation.expert_status === 'answered') {
        // 公開できない状態になっていた場合も、キューには残さず削除する（本人の
        // ダッシュボードに「公開できませんでした」と出し続けるより、単に消える
        // 方がシンプルなため。該当のケースは稀と想定）。
        await supabase.from('expert_pending_answers').delete().eq('id', pending.id);
        continue;
      }

      const payout = consultation.expert_funding === 'volunteer' ? 0 : expertPayout(consultation.price_jpy || 0);
      await supabase
        .from('consultations')
        .update({
          expert_answer: pending.answer,
          expert_status: 'answered',
          expert_id,
          expert_payout_jpy: payout,
        })
        .eq('id', pending.consultation_id);

      await supabase.from('expert_pending_answers').delete().eq('id', pending.id);

      // 質問者への回答通知メール（/api/expert/answerと同じ内容）。送信に失敗しても
      // 承認処理自体は完了済みなので、ここでは結果を待たない。
      if (consultation.member_id) {
        const { data: member } = await supabase.from('members').select('email').eq('id', consultation.member_id).single();
        if (member?.email) {
          const { data: expert } = await supabase.from('experts').select('name, display_name, credential').eq('id', expert_id).single();
          if (expert) {
            const role = answererName(expert.credential);
            const name = expertDisplayName(expert);
            sendEmail({
              to: member.email,
              subject: `【${SITE_NAME}】あなたの相談に${role}から回答が届きました`,
              text: `${SITE_NAME}に投稿いただいた相談に、${name}さん（${role}）から回答が届きました。

相談内容：
${consultation.question.length > 60 ? `${consultation.question.slice(0, 60)}…` : consultation.question}

回答を読む（読み放題会員登録が必要です）：
${SITE_URL}/result/${consultation.id}

${SITE_NAME}
${SITE_URL}`,
            }).catch(() => {});
          }
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}
