import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { CATS, Category } from '@/lib/categories';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { getCategoryDictionaryData, DICTIONARY_INDEX_THRESHOLD } from '@/lib/categorySummary';

// カテゴリ別「お悩み辞典」ページ。実際に寄せられた相談を集約し、AIがまとめた解説文＋
// 実際の相談の抜粋一覧を表示する、SEO向けの入り口ページ（2026-10-15追加）。
// 「ChatGPTと何が違うの」という課題に対し、実在の保護者の相談が土台になっている
// コンテンツで差別化する狙い。
// データベースの最新状態を毎回サーバー側で取得するので、ビルド時の静的化はしない。
export const instant = false;

function isCategory(key: string): key is Category {
  return Object.prototype.hasOwnProperty.call(CATS, key);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  if (!isCategory(category)) {
    return { title: `ページが見つかりません | ${SITE_NAME}` };
  }

  const label = CATS[category].label;
  const { count } = await getCategoryDictionaryData(category);
  const title = `不登校と「${label}」｜よくあるお悩みと実際の相談 - ${SITE_NAME}`;
  const description = `不登校の「${label}」に関する、保護者からの実際の相談をまとめました。よくある傾向と、今できる対応のヒントを紹介します。`;
  const url = `${SITE_URL}/dictionary/${category}`;

  // 投稿が少ないうちは「内容の薄いページ」として検索エンジンの評価を落とすリスクが
  // あるため、一定件数（DICTIONARY_INDEX_THRESHOLD）を超えるまではnoindexにする。
  // 件数は毎回サーバー側で数え直しているため、投稿が増えれば自動でindex対象に切り替わる
  // （手動でのフラグ切り替えは不要。2026-10-15、「公開と同時にやりたい」との相談を受けて
  // 作る・公開するを分離せず自動化した）。
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

export default async function DictionaryCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!isCategory(category)) {
    notFound();
  }

  const cat = CATS[category];
  const { overview, count, consultations } = await getCategoryDictionaryData(category);

  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <Link href="/theme" className="backlink">← テーマ一覧へ</Link>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>
              <img src={cat.icon} alt="" style={{ width: 18, height: 18, objectFit: 'contain', borderRadius: 0, border: 'none' }} />
              不登校と「{cat.label}」
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
              <Link href={`/?category=${category}`} className="btn-secondary">
                「{cat.short}」の相談をすべて見る
              </Link>
            </div>
          )}

          {(category === 'course' || category === 'school') && (
            // 「進路・勉強」「学校との関係」のお悩み辞典ページから、学びの多様化学校
            // （旧：不登校特例校）の都道府県別一覧（/gakko）へリンク（2026-10-18追加）。
            <Link href="/gakko" className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>「学びの多様化学校」という選択肢もあります</div>
              <div className="qtext">
                不登校の子どもに合わせた特別な教育課程を組める学校が、文部科学省の指定で全国に84校あります。お住まいの都道府県の指定校を調べられます。
              </div>
              <div className="muted" style={{ alignSelf: 'flex-end', fontWeight: 700, color: 'var(--orange-text)' }}>
                都道府県から探す ›
              </div>
            </Link>
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
