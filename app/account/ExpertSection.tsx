import { getCurrentExpert } from '@/lib/expertAuth';
import { getSupabaseAdmin } from '@/lib/supabase';
import ExpertManagementPanel from './ExpertManagementPanel';

// 専門家・先輩保護者としての管理内容（旧/expert/dashboard）をアカウントページに
// 統合したもの（2026-11-01、「アカウントページに、専門家や保護者の管理内容も
// 入れ込んじゃえばいい」との方針を受けて）。以前は専門家用ログイン（cookie）が
// 別建てで、ヘッダーの「マイページ」タブからしか辿れなかったため、そのタブが
// 何らかの理由で出なくなると専門家向け機能そのものが見えなくなる問題があった
// （2026-11-01、online_consult_url未マイグレーションによる実例）。
// このセクションは専門家としてログインしていない場合は何も表示しない
// （下にある「専門家として登録・ログイン」の案内カードのみが出る）。
export default async function ExpertSection() {
  const expert = await getCurrentExpert();
  if (!expert) return null;

  if (!expert.verified) {
    const reviewStatus = expert.review_status || 'pending';

    if (reviewStatus === 'rejected') {
      return (
        <div className="card">
          <div style={{ fontWeight: 700 }}>専門家・先輩保護者としてのご登録について</div>
          <div className="qtext">
            この度は「どうする先生」登録にご関心をお寄せいただき、ありがとうございました。
            ご提出いただいた内容を確認した結果、今回は登録要件を満たしていることを確認できなかったため、ご登録を見送らせていただくこととなりました。
          </div>
          {expert.review_note && (
            <div className="qtext" style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 12px', fontSize: 13 }}>
              {expert.review_note}
            </div>
          )}
        </div>
      );
    }

    if (reviewStatus === 'needs_fix') {
      return (
        <div className="card">
          <div style={{ fontWeight: 700 }}>ご登録内容の修正をお願いします</div>
          <div className="qtext">
            ご登録いただいた内容を確認したところ、以下の点についてご修正・再提出をお願いしたく、ご連絡いたしました。
          </div>
          {expert.review_note && (
            <div className="qtext" style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 12px', fontSize: 13 }}>
              {expert.review_note}
            </div>
          )}
          <a className="btn-primary" href="/expert/profile">登録内容を修正する</a>
        </div>
      );
    }

    return (
      <div className="card">
        <div style={{ fontWeight: 700 }}>本人確認中です</div>
        <div className="qtext">
          ご登録いただいた資格情報を、運営が確認しています。確認が完了するまで、相談への回答はできません。確認が完了すると、ここから相談への回答ができるようになります。
        </div>
      </div>
    );
  }

  const supabase = getSupabaseAdmin();
  // 2026-11-01、専門家への質問を恒久的に無料化したのに伴い、先輩保護者をこの
  // キューから除外する理由（価格体系・報酬の違い）自体がなくなったため、常に含める。
  const { data: pending } = await supabase
    .from('consultations')
    .select('*')
    .eq('request_type', 'expert')
    .eq('paid', true)
    .eq('expert_status', 'pending')
    .or(`requested_expert_id.is.null,requested_expert_id.eq.${expert.id}`)
    .order('created_at', { ascending: true });

  const { data: answeredByMe } = await supabase
    .from('consultations')
    .select('*')
    .eq('expert_id', expert.id)
    .eq('expert_status', 'answered')
    .order('created_at', { ascending: false })
    .limit(20);

  // 「この方に直接相談をリクエストする」が押された件数（2026-11-01追加）。
  // オンライン相談リンク（online_consult_url）を既に設定済みなら、リクエストは
  // クライアント側でそちらへ直接誘導されるため記録されない。未設定の間だけ
  // ここで件数を見せ、設定を促す。
  const { count: consultRequestCount } = await supabase
    .from('consult_requests')
    .select('id', { count: 'exact', head: true })
    .eq('expert_id', expert.id);

  // 「報酬を見る」リンクは、質問・回答が恒久的に無料になった今、実際に報酬が発生した
  // 実績（2026-11-01以前の旧価格体系で回答した分）がある人にだけ出す（2026-11-01、
  // 「報酬のページがあるのはへんかな？」との指摘を受けて。無報酬のまま押しても
  // 「質問・回答は無料です」としか出ないリンクを常に出すのは実態と合わないため）。
  const { count: paidAnswerCount } = await supabase
    .from('consultations')
    .select('id', { count: 'exact', head: true })
    .eq('expert_id', expert.id)
    .eq('expert_status', 'answered')
    .gt('expert_payout_jpy', 0);

  return (
    <ExpertManagementPanel
      expert={{ id: expert.id, name: expert.name, credential: expert.credential }}
      pending={pending || []}
      answeredByMe={answeredByMe || []}
      consultRequestCount={!expert.online_consult_url ? consultRequestCount || 0 : 0}
      hasEarningsHistory={!!paidAnswerCount}
    />
  );
}
