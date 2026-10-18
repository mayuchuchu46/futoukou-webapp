import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { isDictionaryTheme, getThemeDictionaryData, DICTIONARY_INDEX_THRESHOLD } from '@/lib/themeSummary';

// テーマ（lib/searchTags.tsの候補ワード）別「不登校お悩み辞典」ページ。
// カテゴリ別のapp/dictionary/[category]/page.tsxと同じ仕組みで、実際に寄せられた
// 相談を集約し、AIがまとめた解説文＋実際の相談の抜粋一覧を表示する（2026-10-15追加、
// 「カテゴリーだけじゃなく、テーマも対象にして」との指摘を受けて）。
// パスを/dictionary/theme/[word]と、カテゴリの/dictionary/[category]とは別セグメントに
// 分けているのは、カテゴリキー（body/social/…）とテーマ語（ADHD/いじめ/…）が
// 同じ文字列空間で衝突しうるため、混同を避けるため。
export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ word: string }>;
}): Promise<Metadata> {
  const { word: raw } = await params;
  const word = decodeURIComponent(raw);
  if (!isDictionaryTheme(word)) {
    return { title: `ページが見つかりません | ${SITE_NAME}` };
  }

  const { count } = await getThemeDictionaryData(word);
  const title = `不登校と「${word}」｜よくあるお悩みと実際の相談 - ${SITE_NAME}`;
  const description = `不登校の「${word}」に関する、保護者からの実際の相談をまとめました。よくある傾向と、今できる対応のヒントを紹介します。`;
  const url = `${SITE_URL}/dictionary/theme/${encodeURIComponent(word)}`;

  // カテゴリ辞典ページと同じ閾値・考え方で、件数が少ないうちはnoindexにする。
  const shouldIndex = count >= DICTIONARY_INDEX_THRESHOLD;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: shouldIndex ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'article',
      locale: 'ja_JP',
    },
  };
}

export default async function DictionaryThemePage({
  params,
}: {
  params: Promise<{ word: string }>;
}) {
  const { word: raw } = await params;
  const word = decodeURIComponent(raw);
  if (!isDictionaryTheme(word)) {
    notFound();
  }

  const { overview, count, consultations } = await getThemeDictionaryData(word);

  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <Link href="/theme" className="backlink">← テーマ一覧へ</Link>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>
              不登校と「{word}」
            </div>
            {overview ? (
              <div className="qtext" style={{ whiteSpace: 'pre-wrap' }}>{overview}</div>
            ) : (
              <div className="muted">
                このテーマの相談はまだ集まっていません。最初の相談を投稿してみませんか？
              </div>
            )}
          </div>

          {count > 0 && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>
                実際に寄せられた相談（{count}件）
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                {consultations.map((c) => (
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
              <Link href={`/?q=${encodeURIComponent(word)}`} className="btn-secondary">
                「{word}」の相談をすべて見る
              </Link>
            </div>
          )}

          <Link href="/ask" className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>あなたの状況も相談してみませんか？</div>
            <div className="qtext">
              学年や状況をかんたんに入力するだけで、どうする先生が今できる次の一手を一緒に考えます。登録不要・匿名で利用できます。
            </div>
            <div className="muted" style={{ alignSelf: 'flex-end', fontWeight: 700, color: 'var(--orange-text)' }}>
              相談するページへ ›
            </div>
          </Link>
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
