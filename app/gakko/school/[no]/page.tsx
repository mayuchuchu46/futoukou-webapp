import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { MANABI_TAYOUKA_GAKKO, MEXT_SOURCE_URL } from '@/lib/data/manabiTayoukaGakko';

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

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: hasEnoughInfo ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { title, description, url, siteName: SITE_NAME, type: 'article', locale: 'ja_JP' },
    twitter: { card: 'summary', title, description },
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

  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <Link href={`/gakko?pref=${encodeURIComponent(school.prefecture)}`} className="backlink" style={{ margin: '14px 0' }}>
            ← {school.prefecture}の一覧へもどる
          </Link>

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
            <Link href="/ask" className="btn-primary sidebar-ask-btn-pink" style={{ textDecoration: 'none', width: '100%' }}>
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
