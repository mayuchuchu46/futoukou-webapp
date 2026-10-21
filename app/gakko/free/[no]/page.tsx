import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { FREE_SCHOOLS } from '@/lib/data/freeSchools';
import { findSimilarFreeSchools } from '@/lib/similarSchools';
import RelatedListingsCard from '@/components/RelatedListingsCard';
import FavoriteButton from '@/components/FavoriteButton';

// フリースクール（地域）、1件ごとの紹介ページ。一覧（/gakko?type=free）の施設名を
// 押すとここに来る（2026-10-21、「学びの多様化学校と同じ仕組みでフリースクールも
// 詳細ページにつなげたい」との要望を受けて、app/gakko/school/[no]/page.tsxと
// 同じ考え方で追加）。
//
// 学びの多様化学校のデータ（manabiTayoukaGakko.ts）と違い、フリースクールの
// データ（freeSchools.ts）にはofficialUrl・noteが無く、住所・連絡先の有無も
// 施設ごとにバラつきがある。住所が確認できている施設だけをindex対象にする
// （学びの多様化学校の詳細ページと同じ閾値の考え方）。
export const instant = false;

function findFreeSchool(noParam: string) {
  const no = Number(noParam);
  if (!Number.isInteger(no)) return null;
  return FREE_SCHOOLS.find((s) => s.no === no) || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ no: string }>;
}): Promise<Metadata> {
  const { no } = await params;
  const school = findFreeSchool(no);
  if (!school) {
    return { title: `ページが見つかりません | ${SITE_NAME}` };
  }
  const title = `${school.name}｜フリースクール - ${SITE_NAME}`;
  const baseDescription = `${school.prefecture}${school.city}にあるフリースクール「${school.name}」の情報です。`;
  const description = school.note ? `${baseDescription}${school.note}` : baseDescription;
  const url = `${SITE_URL}/gakko/free/${school.no}`;
  // 2026-10-21、officialUrl・noteを追加したが、generateMetadataのhasEnoughInfoに
  // officialUrlを反映していなかったため、公式サイト・紹介文が確認できている施設でも
  // ページがnoindexのままになっていた（学びの多様化学校のhasEnoughInfo判定と
  // 同じ考え方に合わせる）。
  const hasEnoughInfo = !!(school.address || school.officialUrl);

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

export default async function FreeSchoolPage({
  params,
}: {
  params: Promise<{ no: string }>;
}) {
  const { no } = await params;
  const school = findFreeSchool(no);
  if (!school) {
    notFound();
  }

  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(school.name + ' ' + school.city)}`;
  const mapQuery = school.address || `${school.name} ${school.prefecture}${school.city}`;
  const schoolUrl = `${SITE_URL}/gakko/free/${school.no}`;

  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '14px 0' }}>
            <Link href={`/gakko?type=free&pref=${encodeURIComponent(school.prefecture)}`} className="backlink">
              ← {school.prefecture}の一覧へもどる
            </Link>
            <Link href="/gakko?type=free" className="backlink">
              フリースクールトップへ
            </Link>
            {/* フリースクールだけでなく、同じ都道府県の学びの多様化学校・通信制高校等も
                含めて回遊してもらえるよう追加（2026-10-22、離脱対策の一環）。 */}
            <Link href={`/gakko/matome?pref=${encodeURIComponent(school.prefecture)}`} className="backlink">
              {school.prefecture}の学び場をまとめて見る
            </Link>
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>{school.name}</div>
            <div className="qtext">
              {school.prefecture}{school.city}にあるフリースクール（民間施設）です。
              {school.note && <> {school.note}</>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 4 }}>
              {[
                { label: '所在地', value: school.address || `${school.prefecture}${school.city}` },
                { label: '連絡先', value: school.contact || '記載なし' },
                { label: '対象', value: school.ageRange || '記載なし' },
                { label: '出典の時点', value: school.asOf },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  <span className="muted" style={{ fontSize: 13 }}>{row.label}</span>
                  <span className="qtext" style={{ fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{row.value}</span>
                </div>
              ))}
            </div>
            {/* 学びの多様化学校の詳細ページと同じ考え方（app/gakko/school/[no]/page.tsx参照）。
                施設の写真は無断転載・AI生成どちらも避け、実際の所在地の地図で代替する。 */}
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

            {/* 相談CTAはこのカードの下部（情報カードの外）にもあるが、情報カードの中で
                すでに検討材料が揃った人向けに、もっと早い位置にも軽い導線を置く
                （2026-10-22、離脱対策の一環。下の大きいCTAカードは削除せず残す）。 */}
            <Link
              href={`/ask?prefill=${encodeURIComponent(`${school.name}について相談したいです。`)}`}
              className="muted"
              style={{ fontSize: 13, textDecoration: 'underline' }}
            >
              この施設について相談する ›
            </Link>

            {/* 公式サイトURL（lib/data/freeSchools.tsのofficialUrl、Web調査で確認できた
                施設のみ）。フリースクールは非営利・NPO運営が多くアフィリエイトの懸念が
                薄いため、通信制高校（app/gakko/tsushin/[no]/page.tsx）の/out経由とは異なり、
                学びの多様化学校と同じ「中立な直リンク」方針で通常の<a>タグを使う
                （2026-10-21追加）。 */}
            {school.officialUrl && (
              <a
                href={school.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ width: '100%', textAlign: 'center' }}
              >
                施設の公式サイトを見る ›
              </a>
            )}
            <FavoriteButton type="free" no={school.no} name={school.name} meta={`${school.prefecture}${school.city}`} />
            <a
              className="share-btn"
              style={{ width: '100%' }}
              href={`https://twitter.com/intent/tweet?${new URLSearchParams({
                text: `${school.name}（${school.prefecture}${school.city}）`,
                url: schoolUrl,
                hashtags: 'どうする先生,フリースクール',
              })}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="share-btn-icon">𝕏</span>
              この施設をシェア
            </a>
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>このページについて</div>
            <div className="qtext">
              このページの情報は、都道府県・市区町村教育委員会等が公開している一覧をもとにしています。利用条件・費用・活動内容などの詳しい情報は含まれていないため、気になる場合は施設に直接お問い合わせください。
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

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>
              {school.name}が合うか、相談してみませんか？
            </div>
            <div className="qtext">
              この施設が今のお子さんの状況に合うかどうかも含め、どうする先生が一緒に考えます。登録不要・匿名で利用できます。
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
              要望を受けて追加（2026-10-21）。同じ市区町村を最優先し、足りなければ
              同じ都道府県内から補う（lib/similarSchools.ts参照）。 */}
          <RelatedListingsCard
            title="他のフリースクールも見てみませんか"
            items={findSimilarFreeSchools(FREE_SCHOOLS, school).map((s) => ({
              key: s.no,
              href: `/gakko/free/${s.no}`,
              name: s.name,
              meta: `${s.prefecture}${s.city}`,
            }))}
          />
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
