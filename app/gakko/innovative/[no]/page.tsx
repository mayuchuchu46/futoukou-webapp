import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { METHOD_LABEL } from '@/lib/data/alternativeSchools';
import { INNOVATIVE_SCHOOLS } from '@/lib/data/innovativeSchools';
import RelatedListingsCard from '@/components/RelatedListingsCard';
import { NoteParagraphs } from '@/components/NoteParagraphs';
import FavoriteButton from '@/components/FavoriteButton';
import FacilityConsultations from '@/components/FacilityConsultations';
import FacilityReviews from '@/components/FacilityReviews';
import SchoolQuotedReviews from '@/components/SchoolQuotedReviews';
import FacilityInfoCard from '@/components/FacilityInfoCard';
import FacilityInfoSubmitForm from '@/components/FacilityInfoSubmitForm';
import FacilityCategoryInfo from '@/components/FacilityCategoryInfo';
import { Suspense } from 'react';
import { SPECIALTY_TAG_LABEL } from '@/lib/data/correspondenceHighSchools';
import { buildBreadcrumbJsonLd } from '@/lib/breadcrumbs';

// 独自教育の私立学校（一条校）、1件ごとの紹介ページ（2026-11-08追加）。
// 一覧（/gakko?type=innovative）の施設名を押すとここに来る。
// app/gakko/alternative/[no]/page.tsx と同じパターンで実装。
// 旧 /gakko/alternative/{1-11} からのリダイレクト先でもある。

export const instant = false;

function findInnovativeSchool(noParam: string) {
  const no = Number(noParam);
  if (!Number.isInteger(no)) return null;
  return INNOVATIVE_SCHOOLS.find((s) => s.no === no) || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ no: string }>;
}): Promise<Metadata> {
  const { no } = await params;
  const school = findInnovativeSchool(no);
  if (!school) {
    return { title: `ページが見つかりません | ${SITE_NAME}` };
  }
  const methodLabel = METHOD_LABEL[school.method];
  const title = `${school.name}｜独自教育の私立学校 - ${SITE_NAME}`;
  const baseDescription = `${school.prefecture}${school.city}にある認可私立学校（一条校）「${school.name}」（${methodLabel}）の情報です。`;
  const description = school.note ? `${baseDescription}${school.note}` : baseDescription;
  const url = `${SITE_URL}/gakko/innovative/${school.no}`;
  const hasEnoughInfo = !!(school.officialUrl || school.address);

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

export default async function InnovativeSchoolPage({
  params,
}: {
  params: Promise<{ no: string }>;
}) {
  const { no } = await params;
  const school = findInnovativeSchool(no);
  if (!school) {
    return notFound();
  }

  const methodLabel = METHOD_LABEL[school.method];
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(school.name + ' ' + school.city)}`;
  const mapQuery = school.address || `${school.name} ${school.prefecture}${school.city}`;
  const schoolUrl = `${SITE_URL}/gakko/innovative/${school.no}`;
  const shareNoteExcerpt = school.note
    ? school.note.length > 50
      ? `${school.note.slice(0, 50)}…`
      : school.note
    : '';

  // schema.org/EducationalOrganization
  const jsonLd = (school.officialUrl || school.address)
    ? {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: school.name,
        ...(school.officialUrl ? { url: school.officialUrl } : {}),
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'JP',
          ...(school.address
            ? { streetAddress: school.address }
            : { addressRegion: school.prefecture, addressLocality: school.city }),
        },
        mainEntityOfPage: schoolUrl,
      }
    : null;

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'ホーム', url: SITE_URL },
    { name: '学び場', url: `${SITE_URL}/gakko?type=innovative` },
    { name: `${school.prefecture}の学び場`, url: `${SITE_URL}/gakko?type=innovative&pref=${encodeURIComponent(school.prefecture)}` },
    { name: school.name, url: schoolUrl },
  ]);

  // 同じ都道府県の他校（最大3件）を「関連一覧」として表示。
  const relatedSchools = INNOVATIVE_SCHOOLS.filter(
    (s) => s.no !== school.no && s.prefecture === school.prefecture
  ).slice(0, 3);
  // 同じ都道府県に他校がなければ、同じ教育メソッドの他校を表示。
  const fallbackRelated =
    relatedSchools.length === 0
      ? INNOVATIVE_SCHOOLS.filter((s) => s.no !== school.no && s.method === school.method).slice(0, 3)
      : [];
  const related = relatedSchools.length > 0 ? relatedSchools : fallbackRelated;

  return (
    <div className="app-shell">
      {jsonLd && (
        // eslint-disable-next-line react/no-danger
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '14px 0' }}>
            <Link href="/gakko?type=innovative" className="backlink">
              ‹ 独自教育の私立学校一覧へもどる
            </Link>
            <Link href={`/gakko/matome?pref=${encodeURIComponent(school.prefecture)}`} className="backlink--forward">
              {school.prefecture}の学び場をまとめて見る
            </Link>
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <h1 className="answer-label" style={{ fontSize: 14, margin: 0 }}>{school.name}</h1>
            <div className="qtext">
              {school.prefecture}{school.city}にある認可私立学校（一条校）です（{methodLabel}）。
              {school.schoolType && <> 対象学年は{school.schoolType}です。</>}
            </div>
            {school.note && (
              <div className="qtext">
                <NoteParagraphs text={school.note} />
              </div>
            )}
            {school.specialties && school.specialties.length > 0 && (
              <div style={{ width: '100%' }}>
                <div className="muted" style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                  伸ばせるコース・活動（公式サイトで確認できたもの）
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {school.specialties.map((sp, i) => (
                    <div key={`${sp.tag}-${i}`} style={{ fontSize: 13 }}>
                      <span className="chip chip-tag" style={{ fontSize: 11, marginRight: 6 }}>{SPECIALTY_TAG_LABEL[sp.tag]}</span>
                      <a href={sp.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>{sp.course}</a>
                    </div>
                  ))}
                </div>
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                  開講状況は年度で異なる場合があります。最新の内容は公式サイトでご確認ください。
                </div>
              </div>
            )}
            {school.admission && (
              <div style={{ width: '100%' }}>
                <div className="muted" style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                  入学・入試について（公式情報で確認できたもの）
                </div>
                <div style={{ fontSize: 13 }}>{school.admission.text}</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                  <a href={school.admission.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>出典ページ</a>
                  　募集内容は年度で変わります。最新の情報は必ず公式にご確認ください。
                </div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 4 }}>
              {[
                { label: '所在地', value: school.address || `${school.prefecture}${school.city}` },
                { label: '対象学年', value: school.schoolType },
                { label: '教育メソッド', value: methodLabel },
                { label: '認可区分', value: '一条校（認可私立学校）' },
                ...(school.contact ? [{ label: '連絡先', value: school.contact }] : []),
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  <span className="muted" style={{ fontSize: 13 }}>{row.label}</span>
                  <span className="qtext" style={{ fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* 費用・特徴タグ（施設からの自己申告、承認済みのみ表示）。 */}
            <Suspense fallback={null}>
              <FacilityInfoCard facilityType="innovative" facilityNo={school.no} />
            </Suspense>

            {/* 地図 */}
            <div style={{ width: '100%' }}>
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=k&z=18&output=embed`}
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
              href={`/ask?prefill=${encodeURIComponent(`「${school.name}」がうちの子に合うかどうか知りたいです。\n\n`)}&childHint=1`}
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
            <FavoriteButton type="innovative" no={school.no} name={school.name} meta={`${school.prefecture}${school.city}・${methodLabel}`} />
            <a
              className="share-btn"
              style={{ width: '100%' }}
              href={`https://twitter.com/intent/tweet?${new URLSearchParams({
                text: `【独自教育の私立学校】「${school.name}」（${school.prefecture}${school.city}・${methodLabel}）${shareNoteExcerpt ? `\n${shareNoteExcerpt}` : ''}`,
                url: schoolUrl,
                hashtags: 'どうする先生,独自教育',
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
              href={`/ask?prefill=${encodeURIComponent(`「${school.name}」がうちの子に合うかどうか知りたいです。\n\n`)}&childHint=1`}
              className="btn-primary sidebar-ask-btn-pink"
              style={{ textDecoration: 'none', width: '100%' }}
            >
              相性を確かめる →
            </Link>
          </div>

          {/* この施設名を含む実際の相談 */}
          <Suspense fallback={null}>
            <FacilityConsultations name={school.name} label={`「${school.name}」についての相談`} />
          </Suspense>

          {/* 行政資料・メディア取材記事・学校公式資料等からの実在の引用口コミ
              （2026-11-08追加）。データがある学校のみ表示（大多数は非表示）。 */}
          <SchoolQuotedReviews facilityType="innovative" facilityNo={school.no} />

          {/* 口コミ */}
          <Suspense fallback={null}>
            <FacilityReviews facilityType="innovative" facilityNo={school.no} facilityName={school.name} />
          </Suspense>

          {/* 同じ都道府県または同じメソッドの他校 */}
          {related.length > 0 && (
            <RelatedListingsCard
              title={
                relatedSchools.length > 0
                  ? `${school.prefecture}の他の独自教育の私立学校`
                  : `同じ${methodLabel}の他の学校`
              }
              items={related.map((s) => ({
                key: s.no,
                href: `/gakko/innovative/${s.no}`,
                name: s.name,
                meta: `${s.prefecture}${s.city}・${METHOD_LABEL[s.method]}`,
              }))}
            />
          )}

          <FacilityCategoryInfo type="innovative" />

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>このページについて</div>
            <div className="qtext">
              このページの情報は、各校の公式サイト・メディア掲載情報・都道府県教育委員会の公開情報等をもとに手動で収集したもの（2026年11月時点）です。利用条件・費用・活動内容・募集状況は変更される場合があるため、
              {school.officialUrl ? '最新の正確な情報は学校の公式サイトで直接ご確認ください。' : '最新の正確な情報は学校に直接お問い合わせください。'}
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

          <FacilityInfoSubmitForm facilityType="innovative" facilityNo={school.no} facilityName={school.name} />
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
