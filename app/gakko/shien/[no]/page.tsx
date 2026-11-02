import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { EDUCATION_SUPPORT_CENTERS } from '@/lib/data/educationSupportCenters';
import FacilityConsultations from '@/components/FacilityConsultations';

// 教育支援センター（適応指導教室）、1件ごとの紹介ページ（2026-11-02追加）。
// 「（個別施設への直リンクして欲しかった）」との指摘を受けて追加した。
// 一覧（app/gakko/ShienExplorer.tsx）・地域の学びの場カード
// （components/LocalSchoolsCard.tsx）からここへリンクする。
//
// フリースクール・学びの多様化学校の詳細ページ（app/gakko/free/[no]・
// app/gakko/school/[no]）と違い、教育支援センターのデータ（lib/data/
// educationSupportCenters.ts）にはofficialUrlが無い（施設ごとの公式サイトを
// Web調査で確認していないため）。sourceUrlは施設単体ではなく、その都道府県・
// 市区町村分をまとめた一覧PDF等を指していることが多いため、「施設の公式サイト」
// ではなく「出典の一覧を見る」という形でリンクする。

function findCenter(noParam: string) {
  const no = Number(noParam);
  if (!Number.isInteger(no)) return null;
  return EDUCATION_SUPPORT_CENTERS.find((s) => s.no === no) || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ no: string }>;
}): Promise<Metadata> {
  const { no } = await params;
  const center = findCenter(no);
  if (!center) {
    return { title: `ページが見つかりません | ${SITE_NAME}` };
  }
  const title = `${center.name}｜教育支援センター - ${SITE_NAME}`;
  const description = `${center.prefecture}${center.city}にある公的・無料の不登校支援施設「教育支援センター（適応指導教室）」${center.name}の情報です。`;
  const url = `${SITE_URL}/gakko/shien/${center.no}`;
  // 住所が確認できている施設のみindex対象にする（他カテゴリの詳細ページと同じ考え方）。
  const hasEnoughInfo = !!center.address;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: hasEnoughInfo ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'article',
      locale: 'ja_JP',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function EducationSupportCenterPage({
  params,
}: {
  params: Promise<{ no: string }>;
}) {
  const { no } = await params;
  const center = findCenter(no);
  if (!center) {
    notFound();
  }

  const mapQuery = center.address || `${center.name} ${center.prefecture}${center.city}`;
  const centerUrl = `${SITE_URL}/gakko/shien/${center.no}`;

  const jsonLd = center.address
    ? {
        '@context': 'https://schema.org',
        '@type': 'GovernmentOffice',
        name: center.name,
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'JP',
          streetAddress: center.address,
        },
        mainEntityOfPage: centerUrl,
      }
    : null;

  return (
    <div className="app-shell">
      {jsonLd && (
        // eslint-disable-next-line react/no-danger
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '14px 0' }}>
            <Link href={`/gakko?type=shien&pref=${encodeURIComponent(center.prefecture)}`} className="backlink">
              ‹ {center.prefecture}の一覧へもどる
            </Link>
            <Link href="/gakko?type=shien" className="backlink">
              教育支援センタートップへ
            </Link>
            <Link href={`/gakko/matome?pref=${encodeURIComponent(center.prefecture)}`} className="backlink--forward">
              {center.prefecture}の学び場をまとめて見る
            </Link>
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>{center.name}</div>
            <div className="qtext">
              {center.prefecture}{center.city}にある、市区町村教育委員会が設置する公的・無料の不登校支援施設（教育支援センター／適応指導教室）です。
              {center.note && <> {center.note}</>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 4 }}>
              {[
                { label: '所在地', value: center.address || `${center.prefecture}${center.city}` },
                { label: '連絡先', value: center.contact || '記載なし' },
                { label: '出典の時点', value: center.asOf },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  <span className="muted" style={{ fontSize: 13 }}>{row.label}</span>
                  <span className="qtext" style={{ fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{row.value}</span>
                </div>
              ))}
            </div>

            {center.address && (
              <div style={{ width: '100%' }}>
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=k&z=18&output=embed`}
                  width="100%"
                  height={220}
                  style={{ border: 0, borderRadius: 12, display: 'block' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${center.name}の地図`}
                />
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(mapQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="muted"
                    style={{ fontSize: 12, textDecoration: 'underline', display: 'inline-block' }}
                  >
                    Googleマップで開く ›
                  </a>
                </div>
              </div>
            )}

            <Link
              href={`/ask?prefill=${encodeURIComponent(`「${center.name}」がうちの子に合うかどうか知りたいです。

`)}&childHint=1`}
              className="btn-primary sidebar-ask-btn-pink"
              style={{ textDecoration: 'none', width: '100%' }}
            >
              うちの子に合うか確かめる →
            </Link>

            {/* sourceUrlは施設単体の公式サイトではなく、その都道府県・市区町村分を
                まとめた一覧PDF等を指しているため、「公式サイト」ではなく「出典」として
                案内する（lib/data/educationSupportCenters.tsのコメント参照）。 */}
            <a
              href={center.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ width: '100%', textAlign: 'center' }}
            >
              出典を見る ›
            </a>

            <a
              className="share-btn"
              style={{ width: '100%' }}
              href={`https://twitter.com/intent/tweet?${new URLSearchParams({
                text: `【教育支援センター】「${center.name}」（${center.prefecture}${center.city}）`,
                url: centerUrl,
                hashtags: 'どうする先生,教育支援センター',
              })}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="share-btn-icon">𝕏</span>
              この施設をシェア
            </a>
          </div>

          {/* この施設名を含む実際の相談（他カテゴリの詳細ページと同じ仕組み、2026-11-02追加）。 */}
          <Suspense fallback={null}>
            <FacilityConsultations name={center.name} label="この施設についての相談" />
          </Suspense>

          <Link href={`/gakko?type=shien&pref=${encodeURIComponent(center.prefecture)}`} className="backlink">
            ← {center.prefecture}の教育支援センター一覧へもどる
          </Link>
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
