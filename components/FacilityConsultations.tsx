import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase';
import { answerFirstLineSnippet } from '@/lib/expertDisplay';
import { coreNameBySuffix } from '@/lib/facilityLinkMatch';

// 施設・学校ページに、その施設名を含む実際の相談を表示する汎用コンポーネント
// （2026-10-22、app/gakko/school/[no]/SchoolConsultations.tsxと同じ仕組みを
// フリースクール・通信制高校・オルタナティブスクールにも広げるため汎用化）。
// 呼び出し側は<Suspense fallback={null}>で囲むこと（DB問い合わせを含むため）。
export default async function FacilityConsultations({
  name,
  altName,
  label = 'この施設についての相談',
}: {
  name: string;
  altName?: string | null;
  label?: string;
}) {
  const supabase = getSupabaseAdmin();
  // 「ヒロック初等部」を「ヒロック」とだけ呼ぶなど、保護者は正式名称から末尾の
  // 種別語（初等部・学園・スクール等）を省いて話すことが多い。完全一致の名称に加え、
  // 末尾の種別語を取り除いた核名称でも検索する（2026-10-31、lib/facilityLinkMatch.ts
  // の核名称マッチングと同じ考え方をこちらのDB検索側にも適用。「ヒロックのページに
  // 相談出てないよ」との指摘を受けて修正）。
  const baseNames = [name, altName].filter((n): n is string => !!n);
  const coreNames = baseNames.map((n) => coreNameBySuffix(n)).filter((n): n is string => !!n);
  const names = [...new Set([...baseNames, ...coreNames])];
  const orFilter = names.map((n) => `question.ilike.%${n}%`).join(',');

  const { data: rows } = await supabase
    .from('consultations')
    .select('id, question, answer, request_type, paid, expert_status, expert_answer')
    .eq('hidden', false)
    .is('parent_id', null)
    .not('answer', 'is', null)
    .or(orFilter)
    .order('created_at', { ascending: false })
    .limit(5);

  if (!rows || rows.length === 0) return null;

  return (
    <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
      <div className="answer-label" style={{ fontSize: 14 }}>
        {label}（{rows.length}件）
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        {rows.map((c) => {
          // 2026-11-01、専門家への質問をAI回答つきの相談に統合したのに伴い、answer列は
          // 常にAIの回答（誰でも無条件に読める）、expert_answer列が専門家・経験者の
          // 回答（会員登録しないと読めない）という役割分担になった。以前はここでanswer
          // をそのまま出すと本来ロックされているはずの専門家回答が漏れる不具合があった
          // （2026-10-31、「この質問はボカシで出したい」との指摘を受けて発覚・修正）が、
          // 今はanswerを出すこと自体は常に安全。専門家の回答がある場合だけ、別途
          // ロック中である旨を追加で示す（詳細ページ側の正規のロック判定に本文は任せる）。
          const isExpertAnswered = c.request_type === 'expert' && c.paid && c.expert_status === 'answered';
          return (
            <Link
              key={c.id}
              href={`/result/${c.id}`}
              style={{ display: 'block', borderBottom: '1px solid var(--border)', paddingBottom: 10, textDecoration: 'none', color: 'inherit' }}
            >
              <div className="qtext" style={{ fontWeight: 700 }}>
                💬 {c.question.slice(0, 60)}
                {c.question.length > 60 ? '…' : ''}
              </div>
              {c.answer && (
                <div className="muted qtext-clamp-3" style={{ fontSize: 13, marginTop: 4 }}>
                  {c.answer}
                </div>
              )}
              {isExpertAnswered && (
                <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                  🔒 専門家・経験者の回答あり：{answerFirstLineSnippet(c.expert_answer || '')}（続きは会員登録で読めます）
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
