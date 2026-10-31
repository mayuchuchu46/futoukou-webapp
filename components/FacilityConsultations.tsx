import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase';
import { answerFirstLineSnippet } from '@/lib/expertDisplay';

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
  const names = [name, altName].filter((n): n is string => !!n);
  const orFilter = names.map((n) => `question.ilike.%${n}%`).join(',');

  const { data: rows } = await supabase
    .from('consultations')
    .select('id, question, answer, request_type, paid, expert_status')
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
          // 専門家・先輩保護者が回答した相談は、answerカラムにもexpert_answerと同じ
          // 本文がそのまま保存されている（/api/expert/answer参照）。このカードは会員・
          // 本人判定をせず誰でも見られる一覧なので、ここでanswerをそのまま出すと、
          // 本来は会員登録しないと読めないはずの回答が無条件に読めてしまう
          // （2026-10-31、「この質問はボカシで出したい」との指摘を受けて発覚・修正）。
          // 詳細ページ（/result/[id]）側の正規のロック判定に任せ、ここでは本文を
          // 見せずロック中である旨だけ示す。
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
              {isExpertAnswered ? (
                <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                  🔒 {answerFirstLineSnippet(c.answer)}（続きは会員登録で読めます）
                </div>
              ) : (
                c.answer && (
                  <div className="muted qtext-clamp-3" style={{ fontSize: 13, marginTop: 4 }}>
                    {c.answer}
                  </div>
                )
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
