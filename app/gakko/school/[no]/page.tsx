import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { MANABI_TAYOUKA_GAKKO, MEXT_SOURCE_URL } from '@/lib/data/manabiTayoukaGakko';
import { findSimilarManabiSchools } from '@/lib/similarSchools';
import RelatedListingsCard from '@/components/RelatedListingsCard';
import SchoolConsultations from './SchoolConsultations';

// 学びの多様化学校、1校ごとの紹介ページ。一覧（/gakko）の学校名を押すとここに来る
// （2026-10-18、「学校名を押したらその学校の紹介ページに行くようにできる？」との
// 指摘を受けて追加）。
//
// 2026-10-18、各校のofficialUrl・addressをWeb調査で追加したが、84校中28校は
// まだ確認できておらずnullのまま（lib/data/manabiTayoukaGakko.ts参照）。
// 文部科学省の一覧にある事実情報（設置形態・学校種・公立/私立・指定年度・所在地の
// 市区町村）だけしか無いページは、他の85ページとほぼ同じテンプレート的な内容に
// なってしまい、検索エンジンに薄いコンテンツとして評価されるおそれがある。そのため、
// officialUrl・addressのどちらも確認できていない学校はnoindex（/dictionary/theme/[word]
// のDICTIONARY_INDEX_THRESHOLDと同じ考え方）にし、情報が増え次第自動でインデックス
// 対象になるようにしている。ページ自体は変わらず閲覧・内部リンクできる。
//
// 2026-10-18、「もうちょいその学校の紹介文かける？」との指摘を受けて、84校中51校に
// lib/data/manabiTayoukaGakko.tsのnoteフィールド（運営法人・愛称・設置場所・開校年月
// など、Web調査で確認できた固有の事実のみ）を追加し、トップの説明文に差し込んでいる。
// 推測で紹介文を埋めることはしていない（note自体が無い学校はテンプレ文のみ）。
//
// 2026-10-18、「SEO的にどう？」との質問を受けて確認し、見つかった漏れを修正：
// (1) サイトマップ（app/sitemap.ts）に82校分のURLが1つも入っていなかった→追加。
// (2) openGraph/twitterにimagesを明示していなかったため、SNSシェア時に画像が
//     付かない状態だった→サイト共通画像（/og-image.png）を明示。学校ごとの写真は
//     無い（実在校を誤って表す画像は載せない方針）ため、個別の写真は使っていない。
// (3) 構造化データ（schema.org/School）が無かった→officialUrl・addressの
//     どちらかが確認できている学校（＝index対象の学校）にのみ付与。
export const instant = false;

function findSchool(noParam: string) {
  const no = Number(noParam);
  if (!Number.isInteger(no)) return null;
  return MANABI_TAYOUKA_GAKKO.find((s) => s.no === no) || null;
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
  const fullName = school.branchName ? `${school.name}（${school.branchName}）` : school.name;
  const title = `${fullName}｜学びの多様化学校 - ${SITE_NAME}`;
  const baseDescription = `${school.prefecture}${school.city}にある学びの多様化学校「${fullName}」（${school.schoolType}・${school.publicPrivate}・${school.designatedYear}指定）の情報です。`;
  const description = school.note ? `${baseDescription}${school.note}` : baseDescription;
  const url = `${SITE_URL}/gakko/school/${school.no}`;
  const hasEnoughInfo = !!(school.officialUrl || school.address);
  // 2026-10-19：学校ごとに学校名入りのOGP画像を動的生成するopengraph-image.tsxを
  // 追加したため、ここで静的なサイト共通画像（/og-image.png）をimagesに明示する
  // 必要がなくなった。/result/[id]/page.tsxのgenerateMetadataと同じく、
  // Next.jsのファイルベースの仕組み（opengraph-image.tsx）に任せ、ここでは
  // imagesを指定しない。

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

export default async function GakkoSchoolPage({
  params,
}: {
  params: Promise<{ no: string }>;
}) {
  const { no } = await params;
  const school = findSchool(no);
  if (!school) {
    notFound();
  }

  const fullName = school.branchName ? `${school.name}（${school.branchName}）` : school.name;
  // 公式サイトURLを持っていないため、代わりに検索リンクを用意する。/out経由の
  // 外部リンク中継（app/out/route.ts）は商業サービス向けの仕組みで、公的な学校
  // 一覧はあえて中立な直リンクのままにする方針（同ファイルのコメント参照）ため、
  // ここも通常の<a>タグで直接リンクする。
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(fullName + ' ' + school.city)}`;
  // Googleマップに渡す検索語。確認済みの住所があれば最優先で使い、無ければ学校名＋
  // 市区町村でマップ検索する（架空の住所を作ることはしない）。
  const mapQuery = school.address || `${fullName} ${school.prefecture}${school.city}`;
  const schoolUrl = `${SITE_URL}/gakko/school/${school.no}`;
  // 構造化データ（schema.org/School）。app/result/[id]/page.tsxのQAPage用jsonLdと
  // 同じ方式（<script type="application/ld+json">）。「SEO的にどう？」との質問を
  // 受けて追加（2026-10-18）。officialUrl・addressのどちらも確認できていない学校
  // （ページ自体がnoindexになっている）は、確かな情報が少ないため出力しない。
  const jsonLd =
    school.officialUrl || school.address
      ? {
          '@context': 'https://schema.org',
          '@type': 'School',
          name: fullName,
          ...(school.branchName ? { alternateName: school.name } : {}),
          ...(school.officialUrl ? { url: school.officialUrl } : {}),
          ...(school.address
            ? { address: { '@type': 'PostalAddress', addressCountry: 'JP', streetAddress: school.address } }
            : { address: { '@type': 'PostalAddress', addressCountry: 'JP', addressRegion: school.prefecture, addressLocality: school.city } }),
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
          {/* 「戻るボタンが埼玉県しかなかったりするけど、学びの多様化学校のページトップに
              戻りたい導線が弱い」との指摘を受けて、都道府県の一覧に戻るリンクに加えて、
              絞り込み無しの/gakkoトップに戻るリンクも並べて置いた（2026-10-18）。 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '14px 0' }}>
            <Link href={`/gakko?pref=${encodeURIComponent(school.prefecture)}`} className="backlink">
              ← {school.prefecture}の一覧へもどる
            </Link>
            <Link href="/gakko" className="backlink">
              学びの多様化学校トップへ
            </Link>
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>{fullName}</div>
            <div className="qtext">
              {school.prefecture}{school.city}にある、{school.publicPrivate}の{school.schoolType}の学びの多様化学校（旧：不登校特例校）です。{school.designatedYear}に指定を受けた、設置形態「{school.type}」の学校です。
              {school.note && <> {school.note}</>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 4 }}>
              {[
                { label: '所在地', value: school.address || `${school.prefecture}${school.city}` },
                { label: '学校種', value: school.schoolType },
                { label: '設置形態', value: school.type },
                { label: '公立／私立', value: school.publicPrivate },
                { label: '指定年度', value: school.designatedYear },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  <span className="muted" style={{ fontSize: 13 }}>{row.label}</span>
                  <span className="qtext" style={{ fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{row.value}</span>
                </div>
              ))}
            </div>
            {/* 「写真イメージはのせられないかなぁ？」との要望を受けて追加（2026-10-18）。
                学校自体の写真は、公式サイト等の写真を無断転載できず、AI生成では実在の学校の
                見た目として不正確な画像になってしまうため、どちらも避けた。代わりに、実際の
                所在地をGoogleマップで示すことで、写真に近い「その場所の実際の様子」を、
                正確な情報のまま見せられるようにした。「建物が見える写真のほうを見せられる？」
                との指摘を受け、初期表示を道路地図（t=m）から航空写真（t=k、建物が写る）に
                変更。ストリートビューにも手動で切替え可能。住所が未確認の学校は、代わりに
                学校名＋市区町村でマップ検索する（ピンの精度は落ちるが、架空の場所を示すことは
                ない）。APIキー不要のGoogleマップ埋め込み（maps.google.com/maps?...&output=embed）
                を利用している。 */}
            <div style={{ width: '100%' }}>
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=k&z=18&output=embed`}
                width="100%"
                height={220}
                style={{ border: 0, borderRadius: 12, display: 'block' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${fullName}の地図`}
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
                {/* ストリートビュー（実際の道路から撮影された写真）。撮影車が通っていない
                    場所（特に他の建物内にある分教室等）では画像が存在しないため、埋め込みは
                    せず別タブで開くリンクのみにしている（2026-10-18、「もっと違う写真の
                    見せ方」との相談を受けて追加）。Maps URLs（map_action=pano）はAPIキー
                    不要で、該当地点にストリートビュー画像があればそれを開く。 */}
                <a
                  href={`https://www.google.com/maps/@?api=1&map_action=pano&query=${encodeURIComponent(mapQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="muted"
                  style={{ fontSize: 12, textDecoration: 'underline', display: 'inline-block' }}
                >
                  ストリートビューで見る ›
                </a>
              </div>
            </div>

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
            {/* このページ自体をシェアできるボタン（2026-10-19、「各学校の詳細ページも
                シェアできるボタンほしい」との要望を受けて追加）。/result/[id]のシェア
                ボタンと同じ.share-btnクラスを使い、学校名＋このページのURLをXで
                共有できるようにする。シェア時のカード画像は、同じく今回追加した
                opengraph-image.tsx（学校名入りの動的OGP画像）が使われる。 */}
            <a
              className="share-btn"
              style={{ width: '100%' }}
              href={`https://twitter.com/intent/tweet?${new URLSearchParams({
                text: `${fullName}（${school.prefecture}${school.city}）`,
                url: schoolUrl,
                hashtags: 'どうする先生,学びの多様化学校',
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
              {school.officialUrl || school.address
                ? 'このページの情報は、文部科学省が公表している指定校一覧と、各校・設置自治体の公式サイト等をもとにしています。学区や転入条件などの詳しい情報は含まれていないため、気になる場合は学校または教育委員会に直接お問い合わせください。'
                : 'このページの情報は、文部科学省が公表している指定校一覧をもとにしています。住所・公式サイトなどの詳しい情報はまだ確認できていないため、気になる学校が見つかったら学校名で検索するか、下記の文部科学省の一覧・学校または教育委員会に直接お問い合わせください。'}
            </div>
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="muted"
              style={{ fontSize: 12, textDecoration: 'underline' }}
            >
              「{fullName}」をWebで調べる ›
            </a>
            <a
              href={MEXT_SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="muted"
              style={{ fontSize: 12, textDecoration: 'underline' }}
            >
              文部科学省の最新の指定校一覧を見る ›
            </a>
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>
              {fullName}が合うか、相談してみませんか？
            </div>
            <div className="qtext">
              この学校が今のお子さんの状況に合うかどうかも含め、どうする先生が一緒に考えます。登録不要・匿名で利用できます。
            </div>
            {/* 「相談するに遷移したら学校名のテキスト入ってる状態が良くない？」との
                指摘を受けて、学校名を相談文の下書きとして渡すようにした（2026-10-18）。
                /ask側（app/ask/page.tsx）でprefillクエリを読み、既存の下書きが無い
                ときだけテキストエリアに入れる。 */}
            <Link
              href={`/ask?prefill=${encodeURIComponent(`${fullName}について相談したいです。`)}`}
              className="btn-primary sidebar-ask-btn-pink"
              style={{ textDecoration: 'none', width: '100%' }}
            >
              相談する →
            </Link>
          </div>

          {/* この学校名を含む実際の相談（2026-10-18追加、「北沢学園についての相談を
              この学校のページに載せたい」との要望を受けて）。DB問い合わせがページ全体の
              表示を止めないよう、/gakkoのRelatedConsultationsと同じくSuspenseで囲む。 */}
          <Suspense fallback={null}>
            <SchoolConsultations schoolName={school.name} branchName={school.branchName} />
          </Suspense>

          {/* 「似ている学校というか、それを見た人が次に見たくなるような掲載」との
              要望を受けて追加（2026-10-21）。同じ都道府県を優先し、足りなければ
              同じ学校種を全国から補う（lib/similarSchools.ts参照）。静的データのみで
              計算できるためDB問い合わせは不要。 */}
          <RelatedListingsCard
            title="他の学びの多様化学校も見てみませんか"
            items={findSimilarManabiSchools(MANABI_TAYOUKA_GAKKO, school).map((s) => ({
              key: s.no,
              href: `/gakko/school/${s.no}`,
              name: s.branchName ? `${s.name}（${s.branchName}）` : s.name,
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
