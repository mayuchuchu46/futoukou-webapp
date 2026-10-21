import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import {
  CORRESPONDENCE_HIGH_SCHOOLS,
  CORRESPONDENCE_HIGH_SCHOOL_SOURCE_URL,
  CORRESPONDENCE_HIGH_SCHOOL_AS_OF,
} from '@/lib/data/correspondenceHighSchools';

// 通信制高校（広域）、1校ごとの紹介ページ（2026-10-21、「学びの多様化学校と同じ仕組みで
// 通信制高校も詳細ページにつなげたい」との要望を受けて、app/gakko/school/[no]/page.tsxと
// 同じ考え方で追加）。
//
// このデータ（correspondenceHighSchools.ts）には本校所在地（所轄庁）の都道府県・
// 市区町村と設置者名しか無く、各校の公式サイトURL・住所・キャンパス所在地は含まれて
// いない（lib/data/correspondenceHighSchools.tsのコメント参照）。確認できている
// 情報が少ないため、このページは当面すべてnoindexとし、確認できた情報が増えた場合に
// 個別に見直す（app/gakko/school/[no]/page.tsxと同じ、情報量に応じたindex方針）。
export const instant = false;

function findSchool(noParam: string) {
  const no = Number(noParam);
  if (!Number.isInteger(no)) return null;
  return CORRESPONDENCE_HIGH_SCHOOLS.find((s) => s.no === no) || null;
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
  const title = `${school.name}｜通信制高校 - ${SITE_NAME}`;
  const description = `本校が${school.prefecture}${school.municipality}にある通信制高校「${school.name}」（設置者：${school.operator}）の情報です。`;
  const url = `${SITE_URL}/gakko/tsushin/${school.no}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    // 確認できている情報が少ないため当面noindex（上記コメント参照）。
    robots: { index: false, follow: true },
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

export default async function TsushinSchoolPage({
  params,
}: {
  params: Promise<{ no: string }>;
}) {
  const { no } = await params;
  const school = findSchool(no);
  if (!school) {
    notFound();
  }

  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(school.name + ' 通信制高校')}`;
  // キャンパス等の正確な住所は持っていないため、本校所在地（所轄庁）＋学校名で検索する
  // （学びの多様化学校の詳細ページで、住所未確認の学校に使っているのと同じ考え方）。
  const mapQuery = `${school.name} ${school.prefecture}${school.municipality}`;
  const schoolUrl = `${SITE_URL}/gakko/tsushin/${school.no}`;

  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '14px 0' }}>
            <Link href={`/gakko?type=tsushin&pref=${encodeURIComponent(school.prefecture)}`} className="backlink">
              ← {school.prefecture}の一覧へもどる
            </Link>
            <Link href="/gakko?type=tsushin" className="backlink">
              通信制高校トップへ
            </Link>
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>{school.name}</div>
            <div className="qtext">
              本校が{school.prefecture}{school.municipality}にある、「広域」通信制高校です。本校の都道府県以外からも入学できます。
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 4 }}>
              {[
                { label: '本校所在地（所轄庁）', value: `${school.prefecture}${school.municipality}` },
                { label: '設置者', value: school.operator },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  <span className="muted" style={{ fontSize: 13 }}>{row.label}</span>
                  <span className="qtext" style={{ fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div style={{ width: '100%' }}>
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=k&z=14&output=embed`}
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

            <a
              className="share-btn"
              style={{ width: '100%' }}
              href={`https://twitter.com/intent/tweet?${new URLSearchParams({
                text: `${school.name}（本校：${school.prefecture}${school.municipality}）`,
                url: schoolUrl,
                hashtags: 'どうする先生,通信制高校',
              })}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="share-btn-icon">𝕏</span>
              この学校をシェア
            </a>
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>このページについて</div>
            <div className="qtext">
              このページの情報は、東京都生活文化局が公開している一覧（{CORRESPONDENCE_HIGH_SCHOOL_AS_OF}）をもとにしています。キャンパス（校舎）の所在地・学費・カリキュラム等の詳しい情報は含まれていないため、気になる学校が見つかったら学校の公式サイトで直接ご確認ください。
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
              href={CORRESPONDENCE_HIGH_SCHOOL_SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="muted"
              style={{ fontSize: 12, textDecoration: 'underline' }}
            >
              出典を見る ›
            </a>
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>
              {school.name}が合うか、相談してみませんか？
            </div>
            <div className="qtext">
              この学校が今のお子さんの状況に合うかどうかも含め、どうする先生が一緒に考えます。登録不要・匿名で利用できます。
            </div>
            <Link
              href={`/ask?prefill=${encodeURIComponent(`${school.name}について相談したいです。`)}`}
              className="btn-primary sidebar-ask-btn-pink"
              style={{ textDecoration: 'none', width: '100%' }}
            >
              相談する →
            </Link>
          </div>
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
