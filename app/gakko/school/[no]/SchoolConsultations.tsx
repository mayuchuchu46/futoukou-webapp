import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase';

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
  const names = [schoolName, branchName].filter((n): n is string => !!n);
  const orFilter = names.map((n) => `question.ilike.%${n}%`).join(',');

  const { data: rows } = await supabase
    .from('consultations')
    .select('id, question, answer')
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
        {rows.map((c) => (
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
          </Link>
        ))}
      </div>
    </div>
  );
}
