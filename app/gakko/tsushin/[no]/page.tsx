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
import { findSimilarCorrespondenceHighSchools } from '@/lib/similarSchools';
import RelatedListingsCard from '@/components/RelatedListingsCard';
import FavoriteButton from '@/components/FavoriteButton';

// 通信制高校（広域）、1校ごとの紹介ページ（2026-10-21、「学びの多様化学校と同じ仕組みで
// 通信制高校も詳細ページにつなげたい」との要望を受けて、app/gakko/school/[no]/page.tsxと
// 同じ考え方で追加）。
//
// このデータ（correspondenceHighSchools.ts）には本校所在地（所轄庁）の都道府県・
// 市区町村と設置者名しか無く、各校のキャンパス所在地等は含まれていない
// （lib/data/correspondenceHighSchools.tsのコメント参照）。公式サイトURLを
// Web調査で確認できた学校のみindexし、未確認の学校はnoindexとする
// （app/gakko/school/[no]/page.tsxと同じ、情報量に応じたindex方針。2026-10-21、
// 全115校の公式サイトURL調査完了に合わせて見直し。それまでは確認できている
// 情報が少なく全校noindexだった）。
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
    // 公式サイトURLが確認できている学校のみindex（上記コメント参照）。
    robots: { index: !!school.officialUrl, follow: true },
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
            {/* 通信制高校だけでなく、同じ都道府県（本校所在地）の学びの多様化学校・
                フリースクール等も含めて回遊してもらえるよう追加（2026-10-22、離脱対策の一環）。 */}
            <Link href={`/gakko/matome?pref=${encodeURIComponent(school.prefecture)}`} className="backlink">
              {school.prefecture}の学び場をまとめて見る
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
            {/* 公式サイトURL（lib/data/correspondenceHighSchools.tsのofficialUrl、Web調査で
                確認できた学校のみ）。通信制高校は私立運営が多く、資料請求等のアフィリエイト
                プログラムを持つ学校があるため、学びの多様化学校・フリースクールの詳細ページ
                （中立な直リンク）とは異なり、app/out/route.ts経由でリンクする（将来
                アフィリエイトタグ・クリック計測を付けたくなっても、このページ側は
                書き換え不要にするための下準備。2026-10-21追加、現時点ではURLデータが
                無いためこのボタン自体はまだどの学校にも表示されない）。 */}
            {school.officialUrl && (
              <a
                href={`/out?to=${encodeURIComponent(school.officialUrl)}&id=tsushin-${school.no}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ width: '100%', textAlign: 'center' }}
              >
                学校の公式サイトを見る ›
              </a>
            )}
            <FavoriteButton type="tsushin" no={school.no} name={school.name} meta={`${school.prefecture}${school.municipality}`} />
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

            {/* 相談CTAはこのカードの下部（情報カードの外）にもあるが、情報カードの中で
                すでに検討材料が揃った人向けに、もっと早い位置にも軽い導線を置く
                （2026-10-22、離脱対策の一環。下の大きいCTAカードは削除せず残す）。 */}
            <Link
              href={`/ask?prefill=${encodeURIComponent(`${school.name}について相談したいです。`)}`}
              className="muted"
              style={{ fontSize: 13, textDecoration: 'underline' }}
            >
              この学校について相談する ›
            </Link>

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

          {/* 「似ている学校というか、それを見た人が次に見たくなるような掲載」との
              要望を受けて追加（2026-10-21）。本校所在地の都道府県が同じ学校を優先し、
              足りなければ同じ設置者（学校法人・企業）の他校を補う（lib/similarSchools.ts
              参照）。 */}
          <RelatedListingsCard
            title="他の通信制高校も見てみませんか"
            items={findSimilarCorrespondenceHighSchools(CORRESPONDENCE_HIGH_SCHOOLS, school).map((s) => ({
              key: s.no,
              href: `/gakko/tsushin/${s.no}`,
              name: s.name,
              meta: `${s.prefecture}${s.municipality}`,
            }))}
          />
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
