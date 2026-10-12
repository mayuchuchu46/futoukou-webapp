import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase';

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
  return NextResponse.json({ ok: true });
}
