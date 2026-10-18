import Link from 'next/link';
import { getThemeDictionaryData } from '@/lib/themeSummary';

// /gakkoページ唯一のDB問い合わせ（lib/themeSummary.ts）。以前はページ本体（GakkoPage）の
// 中で直接awaitしていたため、このデータベース往復が終わるまでページ全体（ヘッダー・
// バナー・タブ・絞り込みチップなど、本来すぐ出せる部分）の表示がブロックされてしまい、
// 「やっぱりすごく重い」との指摘につながった（2026-10-18）。
// app/result/[id]/page.tsxのSuspense利用パターンと同じく、この部分だけ別コンポーネントに
// 切り出し、呼び出し側（page.tsx）で<Suspense fallback={null}>に包むことで、他の部分は
// 即座に表示され、この「関連する相談」カードだけ後から追いかけて表示されるようにした。
export default async function RelatedConsultations({ themeWord }: { themeWord: string }) {
  const themeData = await getThemeDictionaryData(themeWord);
  if (!themeData || themeData.count === 0) return null;

  return (
    <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
      <div className="answer-label" style={{ fontSize: 14 }}>
        「{themeWord}」に関する実際の相談（{themeData.count}件）
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
        {themeData.consultations.slice(0, 5).map((c) => (
          <Link
            key={c.id}
            href={`/result/${c.id}`}
            className="qtext"
            style={{ display: 'block', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}
          >
            {c.question.slice(0, 60)}{c.question.length > 60 ? '…' : ''}
          </Link>
        ))}
      </div>
      <Link href={`/dictionary/theme/${encodeURIComponent(themeWord)}`} className="btn-secondary">
        「{themeWord}」の相談をもっと見る
      </Link>
    </div>
  );
}
