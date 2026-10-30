import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { ALTERNATIVE_SCHOOLS, METHOD_LABEL } from '@/lib/data/alternativeSchools';
import RelatedListingsCard from '@/components/RelatedListingsCard';
import FavoriteButton from '@/components/FavoriteButton';
import FacilityConsultations from '@/components/FacilityConsultations';
import { Suspense } from 'react';
import { SPECIALTY_TAG_LABEL } from '@/lib/data/correspondenceHighSchools';

// オルタナティブスクール、1件ごとの紹介ページ（2026-10-29追加）。
// 一覧（/gakko?type=alternative）の施設名を押すとここに来る。
// app/gakko/free/[no]/page.tsx と同じパターンで実装。

export const instant = false;

function findAlternativeSchool(noParam: string) {
  const no = Number(noParam);
  if (!Number.isInteger(no)) return null;
  return ALTERNATIVE_SCHOOLS.find((s) => s.no === no) || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ no: string }>;
}): Promise<Metadata> {
  const { no } = await params;
  const school = findAlternativeSchool(no);
  if (!school) {
    return { title: `ページが見つかりません | ${SITE_NAME}` };
  }
  const methodLabel = METHOD_LABEL[school.method];
  const accreditedLabel = school.isAccredited ? '認可私立学校（一条校）' : '認可外施設';
  const title = `${school.name}｜オルタナティブスクール - ${SITE_NAME}`;
  const baseDescription = `${school.prefecture}${school.city}にある${accreditedLabel}「${school.name}」（${methodLabel}）の情報です。`;
  const description = school.note ? `${baseDescription}${school.note}` : baseDescription;
  const url = `${SITE_URL}/gakko/alternative/${school.no}`;
  // 公式サイトが確認できている施設のみindex対象にする（freeSchoolページと同じ閾値）。
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

export default async function AlternativeSchoolPage({
  params,
}: {
  params: Promise<{ no: string }>;
}) {
  const { no } = await params;
  const school = findAlternativeSchool(no);
  if (!school) {
    return notFound();
  }

  const methodLabel = METHOD_LABEL[school.method];
  const accreditedLabel = school.isAccredited ? '認可私立学校（一条校）' : '認可外施設';
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(school.name + ' ' + school.city)}`;
  const mapQuery = school.address || `${school.name} ${school.prefecture}${school.city}`;
  const schoolUrl = `${SITE_URL}/gakko/alternative/${school.no}`;
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

  // 同じ都道府県の他のオルタナティブスクール（最大3件）を「関連一覧」として表示。
  const relatedSchools = ALTERNATIVE_SCHOOLS.filter(
    (s) => s.no !== school.no && s.prefecture === school.prefecture
  ).slice(0, 3);
  // 同じ都道府県に他校がなければ、同じ教育メソッドの他校を表示。
  const fallbackRelated =
    relatedSchools.length === 0
      ? ALTERNATIVE_SCHOOLS.filter((s) => s.no !== school.no && s.method === school.method).slice(0, 3)
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
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '14px 0' }}>
            <Link href="/gakko?type=alternative" className="backlink">
              ‹ オルタナティブスクール一覧へもどる
            </Link>
            <Link href={`/gakko/matome?pref=${encodeURIComponent(school.prefecture)}`} className="backlink--forward">
              {school.prefecture}の学び場をまとめて見る
            </Link>
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>{school.name}</div>
            <div className="qtext">
              {school.prefecture}{school.city}にある{accreditedLabel}です（{methodLabel}）。
              {school.schoolType && <> 対象学年は{school.schoolType}です。</>}
              {school.note && <> {school.note}</>}
            </div>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 4 }}>
              {[
                { label: '所在地', value: school.address || `${school.prefecture}${school.city}` },
                { label: '対象学年', value: school.schoolType },
                { label: '教育メソッド', value: methodLabel },
                { label: '認可区分', value: school.isAccredited ? '一条校（認可私立学校）' : '認可外施設（フリースクール等）' },
                ...(school.contact ? [{ label: '連絡先', value: school.contact }] : []),
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  <span className="muted" style={{ fontSize: 13 }}>{row.label}</span>
                  <span className="qtext" style={{ fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{row.value}</span>
                </div>
              ))}
            </div>

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

            {/* 公式サイト（直リンク方針。フリースクール・学びの多様化学校と同様）。 */}
            {school.officialUrl && (
              <a
                href={school.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ width: '100%', textAlign: 'center' }}
              >
                {school.isAccredited ? '学校の公式サイトを見る ›' : '施設の公式サイトを見る ›'}
              </a>
            )}
            <FavoriteButton type="alternative" no={school.no} name={school.name} meta={`${school.prefecture}${school.city}・${methodLabel}`} />
            <a
              className="share-btn"
              style={{ width: '100%' }}
              href={`https://twitter.com/intent/tweet?${new URLSearchParams({
                text: `【オルタナティブスクール】「${school.name}」（${school.prefecture}${school.city}・${methodLabel}）${shareNoteExcerpt ? `\n${shareNoteExcerpt}` : ''}`,
                url: schoolUrl,
                hashtags: 'どうする先生,オルタナティブスクール',
              })}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="share-btn-icon">𝕏</span>
              この施設をシェア
            </a>
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>
              うちの子に合うか、確かめてみませんか？
            </div>
            <div className="qtext">
              この{school.isAccredited ? '学校' : '施設'}が今のお子さんの状況に合うかどうかも含め、どうする先生が一緒に考えます。登録不要・匿名で利用できます。
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

          {/* 同じ都道府県または同じメソッドの他校 */}
          {related.length > 0 && (
            <RelatedListingsCard
              title={
                relatedSchools.length > 0
                  ? `${school.prefecture}の他のオルタナティブスクール`
                  : `同じ${methodLabel}の他のスクール`
              }
              items={related.map((s) => ({
                key: s.no,
                href: `/gakko/alternative/${s.no}`,
                name: s.name,
                meta: `${s.prefecture}${s.city}・${METHOD_LABEL[s.method]}`,
              }))}
            />
          )}

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>このページについて</div>
            <div className="qtext">
              このページの情報は、各校の公式サイト・メディア掲載情報・都道府県教育委員会の公開情報等をもとに手動で収集したもの（2026年10月時点）です。利用条件・費用・活動内容・募集状況は変更される場合があるため、
              {school.officialUrl ? '最新の正確な情報は学校・施設の公式サイトで直接ご確認ください。' : '最新の正確な情報は学校・施設に直接お問い合わせください。'}
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
