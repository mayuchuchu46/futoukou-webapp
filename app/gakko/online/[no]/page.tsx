import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { ONLINE_FREE_SCHOOLS, OnlineFreeSchool } from '@/lib/data/onlineFreeSchools';
import { findSimilarOnlineFreeSchools } from '@/lib/similarSchools';
import RelatedListingsCard from '@/components/RelatedListingsCard';
import FavoriteButton from '@/components/FavoriteButton';
import FacilityConsultations from '@/components/FacilityConsultations';
import { Suspense } from 'react';

// オンラインフリースクール、1校ごとの紹介ページ（2026-10-21追加）。
//
// これまでオンラインフリースクールだけは、一覧（/gakko?type=online・/gakko/matome）の
// リンクを押すと/out経由でそのまま外部サイトに出ていた。学びの多様化学校・フリースクール
// （地域）・通信制高校は先に1校ごとの紹介ページ（/gakko/school/[no]等）を経由する作りに
// なっているのに対して不統一だった上、「まず内部ページで循環させたい」との指摘を受け、
// 他のカテゴリと同じ構成（紹介ページ→公式サイトへのボタン）に揃えた。
//
// ONLINE_FREE_SCHOOLSの各施設情報自体は元々すべて確認済みのデータのため、全件を
// index対象とする（他カテゴリのofficialUrl・address未確認によるnoindex分岐は不要）。
export const instant = false;

const CATEGORY_LABEL: Record<OnlineFreeSchool['category'], string> = {
  community: '仲間づくり・居場所のあるタイプ',
  tutoring: '学習サポート中心（個別指導・家庭教師タイプ）',
  referral: '利用に条件があるもの（自治体等からの紹介が必要）',
};

function findSchool(noParam: string) {
  const no = Number(noParam);
  if (!Number.isInteger(no)) return null;
  return ONLINE_FREE_SCHOOLS.find((s) => s.no === no) || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ no: string }>;
}): Promise<Metadata> {
  const { no } = await params;
  const school = findSchool(no);
  if (!school) {
    return { title: `ページが見つかりません | ${SITE_NAME}` };
  }
  const title = `${school.name}｜オンラインフリースクール - ${SITE_NAME}`;
  const description = `居住地を問わず利用できるオンラインフリースクール「${school.name}」（運営：${school.operator}、対象：${school.ageRange}）の情報です。`;
  const url = `${SITE_URL}/gakko/online/${school.no}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
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

export default async function OnlineSchoolPage({
  params,
}: {
  params: Promise<{ no: string }>;
}) {
  const { no } = await params;
  const school = findSchool(no);
  if (!school) {
    notFound();
  }

  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(school.name)}`;
  const schoolUrl = `${SITE_URL}/gakko/online/${school.no}`;

  // 構造化データ（schema.org/EducationalOrganization）。全件index対象のため全件出力。
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: school.name,
    url: school.url,
    description: `居住地を問わず利用できるオンラインフリースクール（${CATEGORY_LABEL[school.category]}）。運営：${school.operator}、対象：${school.ageRange}`,
    mainEntityOfPage: schoolUrl,
  };

  return (
    <div className="app-shell">
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '14px 0' }}>
            <Link href="/gakko?type=online" className="backlink">
              ‹ オンラインフリースクールの一覧へもどる
            </Link>
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>{school.name}</div>
            <div className="qtext">
              居住地を問わず、全国どこからでも利用できるオンラインフリースクールです。
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 4 }}>
              {[
                { label: '種類', value: CATEGORY_LABEL[school.category] },
                { label: '運営', value: school.operator },
                { label: '対象', value: school.ageRange },
                { label: '連絡先', value: school.contact },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  <span className="muted" style={{ fontSize: 13, flex: '0 0 auto' }}>{row.label}</span>
                  <span className="qtext" style={{ fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{row.value}</span>
                </div>
              ))}
            </div>
            {school.note && (
              <div className="muted" style={{ fontSize: 12 }}>{school.note}</div>
            )}
            {school.sourceKind === 'official-site' && (
              <div className="muted" style={{ fontSize: 12 }}>
                ※ 政府・教育委員会の公開一覧には掲載されておらず、運営会社・団体自身の公式サイト等の発表に基づく情報です。
              </div>
            )}

            {/* 相談CTAはこのカードの下部（情報カードの外）にもあるが、情報カードの中で
                すでに検討材料が揃った人向けに、もっと早い位置にもCTAを置く（2026-10-22、
                離脱対策の一環）。最初はmutedの文字リンク→btn-secondaryと試したが、
                「相談するボタンはいつもピンクがいい」との方針により、下部のCTAカードと
                同じsidebar-ask-btn-pinkに統一した。 */}
            <Link
              href={`/ask?prefill=${encodeURIComponent(`「${school.name}」がうちの子に合うかどうか知りたいです。

子どもの特徴：（性格・好き嫌い・困りごとなど、思いつくまま書いてください）`)}`}
              className="btn-primary sidebar-ask-btn-pink"
              style={{ textDecoration: 'none', width: '100%' }}
            >
              うちの子に合うか確かめる →
            </Link>

            <a
              href={`/out?to=${encodeURIComponent(school.url)}&id=online-${school.no}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ width: '100%', textAlign: 'center' }}
            >
              公式サイトを見る ›
            </a>

            <FavoriteButton type="online" no={school.no} name={school.name} meta={CATEGORY_LABEL[school.category]} />

            <a
              className="share-btn"
              style={{ width: '100%' }}
              href={`https://twitter.com/intent/tweet?${new URLSearchParams({
                text: `不登校の子が自宅から参加できる「${school.name}」（オンラインフリースクール）の情報を見つけました。`,
                url: schoolUrl,
                hashtags: 'どうする先生,オンラインフリースクール',
              })}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="share-btn-icon">𝕏</span>
              この学校をシェア
            </a>
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>
              うちの子に合うか、確かめてみませんか？
            </div>
            <div className="qtext">
              子どもの状況を話すだけで、どうする先生がこの学校との相性を一緒に考えます。登録不要・匿名で使えます。
            </div>
            <Link
              href={`/ask?prefill=${encodeURIComponent(`「${school.name}」がうちの子に合うかどうか知りたいです。

子どもの特徴：（性格・好き嫌い・困りごとなど、思いつくまま書いてください）`)}`}
              className="btn-primary sidebar-ask-btn-pink"
              style={{ textDecoration: 'none', width: '100%' }}
            >
              相性を確かめる →
            </Link>
          </div>

          {/* この施設名を含む実際の相談（2026-10-22追加）。 */}
          <Suspense fallback={null}>
            <FacilityConsultations name={school.name} label="この学校についての相談" />
          </Suspense>

          {/* 「似ている学校というか、それを見た人が次に見たくなるような掲載」との
              要望を受けて追加（2026-10-21）。都道府県の概念が無いため、唯一の分類項目
              であるcategory（種類）が同じ施設を挙げる（lib/similarSchools.ts参照）。 */}
          <RelatedListingsCard
            title="他のオンラインフリースクールも見てみませんか"
            items={findSimilarOnlineFreeSchools(ONLINE_FREE_SCHOOLS, school).map((s) => ({
              key: s.no,
              href: `/gakko/online/${s.no}`,
              name: s.name,
              meta: CATEGORY_LABEL[s.category],
            }))}
          />

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>このページについて</div>
            <div className="qtext">
              このページの情報は、教育委員会等の公開資料または運営会社・団体自身の公式サイトをもとにしています（上記の出典欄参照）。出席扱いの実績・学費等の詳しい情報は含まれていないため、気になる場合は公式サイトで直接ご確認ください。
            </div>
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="muted"
              style={{ fontSize: 12, textDecoration: 'underline' }}
            >
              「{school.name}」をWebで調べる ›
            </a>
            <a
              href={school.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="muted"
              style={{ fontSize: 12, textDecoration: 'underline' }}
            >
              出典を見る ›
            </a>
          </div>
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
