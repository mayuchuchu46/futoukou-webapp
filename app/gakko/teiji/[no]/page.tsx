import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { teijiseiHighSchools } from '@/lib/data/teijiseiHighSchools';
import { findSimilarTeijiseiHighSchools } from '@/lib/similarSchools';
import RelatedListingsCard from '@/components/RelatedListingsCard';
import FavoriteButton from '@/components/FavoriteButton';
import FacilityConsultations from '@/components/FacilityConsultations';
import { Suspense } from 'react';

// 定時制高校、1件ごとの紹介ページ（2026-10-29追加）。他カテゴリ
// （app/gakko/free/[no]/page.tsx等）と同じ構成にしている。
//
// 定時制高校のデータ（lib/data/teijiseiHighSchools.ts）には住所は無く、
// 市区町村（municipality）までしか確認できていない学校も多い。地図は
// municipalityが確認できている学校のみ表示する。
export const instant = false;

function findTeijiSchool(noParam: string) {
  const no = Number(noParam);
  if (!Number.isInteger(no)) return null;
  return teijiseiHighSchools.find((s) => s.no === no) || null;
}

function schoolCategoryLabel(school: ReturnType<typeof findTeijiSchool>) {
  if (!school?.schoolCategory) return null;
  return school.schoolCategory === 'attached' ? '全日制高校等に併設された定時制課程' : '定時制単独校（多部制等）';
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ no: string }>;
}): Promise<Metadata> {
  const { no } = await params;
  const school = findTeijiSchool(no);
  if (!school) {
    return { title: `ページが見つかりません | ${SITE_NAME}` };
  }
  const title = `${school.name}${school.nickname ? `（${school.nickname}）` : ''}｜定時制高校 - ${SITE_NAME}`;
  const baseDescription = `${school.prefecture}${school.municipality || ''}にある定時制高校「${school.name}」の情報です。`;
  const description = school.note ? `${baseDescription}${school.note}` : baseDescription;
  const url = `${SITE_URL}/gakko/teiji/${school.no}`;
  const hasEnoughInfo = !!(school.municipality || school.officialUrl);

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

export default async function TeijiSchoolPage({
  params,
}: {
  params: Promise<{ no: string }>;
}) {
  const { no } = await params;
  const school = findTeijiSchool(no);
  if (!school) {
    notFound();
  }

  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(school.name + ' 定時制')}`;
  // 市区町村が未確認の学校でも、学校名＋都道府県での地図検索は可能なことが多いため、
  // 以前は市区町村が確認できた学校のみ地図を出していたのを、無い場合は学校名＋都道府県
  // にフォールバックする形に変更した（2026-10-29、「通信制と同じようにマップを出して
  // ほしい」との要望を受けて。通信制高校の詳細ページ（app/gakko/tsushin/[no]/page.tsx）
  // も学校名＋都道府県＋市区町村の検索ベースの地図で、常に表示している）。
  const mapQuery = `${school.name} ${school.prefecture}${school.municipality || ''}`;
  const schoolUrl = `${SITE_URL}/gakko/teiji/${school.no}`;
  const shareNoteExcerpt = school.note
    ? school.note.length > 50
      ? `${school.note.slice(0, 50)}…`
      : school.note
    : '';

  const jsonLd = (school.municipality || school.officialUrl)
    ? {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: school.name,
        ...(school.officialUrl ? { url: school.officialUrl } : {}),
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'JP',
          addressRegion: school.prefecture,
          ...(school.municipality ? { addressLocality: school.municipality } : {}),
        },
        mainEntityOfPage: schoolUrl,
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
            <Link href={`/gakko?type=teiji&pref=${encodeURIComponent(school.prefecture)}`} className="backlink">
              ‹ {school.prefecture}の一覧へもどる
            </Link>
            <Link href="/gakko?type=teiji" className="backlink">
              定時制高校トップへ
            </Link>
            <Link href={`/gakko/matome?pref=${encodeURIComponent(school.prefecture)}`} className="backlink--forward">
              {school.prefecture}の学び場をまとめて見る
            </Link>
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>
              {school.name}
              {school.nickname && (
                <span className="chip chip-tag" style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', marginLeft: 8 }}>
                  {school.nickname}
                </span>
              )}
            </div>
            <div className="qtext">
              {school.prefecture}{school.municipality || ''}にある{school.publicPrivate}の定時制高校です。
              {school.note && <> {school.note}</>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 4 }}>
              {[
                { label: '所在地', value: school.municipality ? `${school.prefecture}${school.municipality}` : school.prefecture },
                { label: '設置者', value: school.operator || '記載なし' },
                { label: '課程', value: schoolCategoryLabel(school) || '記載なし' },
                { label: '部制', value: school.parts || '記載なし' },
                { label: '仕組み', value: school.curriculumType || '記載なし' },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  <span className="muted" style={{ fontSize: 13 }}>{row.label}</span>
                  <span className="qtext" style={{ fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{row.value}</span>
                </div>
              ))}
            </div>

            <div style={{ width: '100%' }}>
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=k&z=15&output=embed`}
                width="100%"
                height={220}
                style={{ border: 0, borderRadius: 12, display: 'block' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${school.name}の地図`}
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

            <Link
              href={`/ask?prefill=${encodeURIComponent(`「${school.name}」がうちの子に合うかどうか知りたいです。

`)}&childHint=1`}
              className="btn-primary sidebar-ask-btn-pink"
              style={{ textDecoration: 'none', width: '100%' }}
            >
              うちの子に合うか確かめる →
            </Link>

            {school.officialUrl && (
              <a
                href={school.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ width: '100%', textAlign: 'center' }}
              >
                学校の公式サイトを見る ›
              </a>
            )}
            <FavoriteButton type="teiji" no={school.no} name={school.name} meta={`${school.prefecture}${school.municipality || ''}`} />
            <a
              className="share-btn"
              style={{ width: '100%' }}
              href={`https://twitter.com/intent/tweet?${new URLSearchParams({
                text: `定時制高校「${school.name}」${school.nickname ? `（${school.nickname}）` : ''}（${school.prefecture}${school.municipality || ''}）${shareNoteExcerpt ? `\n${shareNoteExcerpt}` : ''}`,
                url: schoolUrl,
                hashtags: 'どうする先生,定時制高校',
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
              この学校が今のお子さんの状況に合うかどうかも含め、どうする先生が一緒に考えます。登録不要・匿名で利用できます。
            </div>
            <Link
              href={`/ask?prefill=${encodeURIComponent(`「${school.name}」がうちの子に合うかどうか知りたいです。

`)}&childHint=1`}
              className="btn-primary sidebar-ask-btn-pink"
              style={{ textDecoration: 'none', width: '100%' }}
            >
              相性を確かめる →
            </Link>
          </div>

          <Suspense fallback={null}>
            <FacilityConsultations name={school.name} label="この学校についての相談" />
          </Suspense>

          <RelatedListingsCard
            title="他の定時制高校も見てみませんか"
            items={findSimilarTeijiseiHighSchools(teijiseiHighSchools, school).map((s) => ({
              key: s.no,
              href: `/gakko/teiji/${s.no}`,
              name: s.name,
              meta: `${s.prefecture}${s.municipality || ''}`,
            }))}
          />

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>このページについて</div>
            <div className="qtext">
              このページの情報は、都道府県教育委員会等が公開している一覧・入学者選抜実施要項や、確認できた範囲の公式サイト等をもとにしています。募集の有無・学科・入学条件は変更される場合があるため、
              {school.officialUrl ? '最新の正確な情報は学校の公式サイトで直接ご確認ください。' : '最新の正確な情報は学校または教育委員会に直接お問い合わせください。'}
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
          </div>
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
