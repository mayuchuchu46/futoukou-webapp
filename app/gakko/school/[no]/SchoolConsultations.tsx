import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase';
import { answerFirstLineSnippet } from '@/lib/expertDisplay';
import { coreNameBySuffix } from '@/lib/facilityLinkMatch';

// この学校について実際に寄せられた相談を学校ページに表示する（2026-10-18追加、
// 「北沢学園についての相談を、この学校のページに載せたい」との要望を受けて）。
// /gakkoのRelatedConsultations.tsx（テーマ語での一致）と同じ考え方で、学校名・
// branchName（愛称）のいずれかを相談文に含む、実ユーザーの相談（返信/ラリーは除く）を
// 新しい順に表示する。該当が無ければ何も表示しない（存在しない相談を匂わせない）。
// app/gakko/page.tsxと同じ理由（DB問い合わせでページ全体の表示を止めない）で、
// 呼び出し側（page.tsx）がこれを<Suspense fallback={null}>で囲む。
export default async function SchoolConsultations({
  schoolName,
  branchName,
}: {
  schoolName: string;
  branchName: string | null;
}) {
  const supabase = getSupabaseAdmin();
  // 正式名称の末尾の種別語（中等部・学園等）を省いた口語的な呼び方でも検出できる
  // ようにする（2026-10-31、components/FacilityConsultations.tsxと同じ対応）。
  const baseNames = [schoolName, branchName].filter((n): n is string => !!n);
  const coreNames = baseNames.map((n) => coreNameBySuffix(n)).filter((n): n is string => !!n);
  const names = [...new Set([...baseNames, ...coreNames])];
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
        この学校についての相談（{rows.length}件）
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
