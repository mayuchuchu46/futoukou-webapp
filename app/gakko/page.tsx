import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { MANABI_TAYOUKA_GAKKO, MEXT_SOURCE_URL } from '@/lib/data/manabiTayoukaGakko';
import { PREFECTURES } from '@/lib/data/prefectures';

// 「学びの多様化学校」（旧：不登校特例校）の全国一覧ページ。文部科学省が公表している
// 指定校リスト（MANABI_TAYOUKA_GAKKO、手動で取り込んだ静的データ）を都道府県で絞り込んで
// 表示する。相談結果ページ（進路・学校カテゴリ）からの導線先として追加（2026-10-18）。
// データはMEXTの公開情報で著作権上の問題がなく、更新頻度も低いため、Supabaseに
// テーブルを作らずアプリ内の静的データとして持つ（「時間をかけたくない」との方針に合わせた
// 最小実装）。
export const metadata: Metadata = {
  title: `学びの多様化学校（不登校特例校）を都道府県から探す｜${SITE_NAME}`,
  description:
    '不登校の子どもに合わせた特別な教育課程を組める「学びの多様化学校」（旧：不登校特例校）を都道府県から探せます。文部科学省の指定校一覧をもとに掲載しています。',
  alternates: { canonical: `${SITE_URL}/gakko` },
};

function prefectureCount(pref: string) {
  return MANABI_TAYOUKA_GAKKO.filter((s) => s.prefecture === pref).length;
}

export default async function GakkoPage({
  searchParams,
}: {
  searchParams: Promise<{ pref?: string }>;
}) {
  const { pref } = await searchParams;
  const selected = pref && PREFECTURES.includes(pref) ? pref : null;
  const schools = selected ? MANABI_TAYOUKA_GAKKO.filter((s) => s.prefecture === selected) : [];

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <Link href="/" className="backlink" style={{ margin: '14px 0' }}>← もどる</Link>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>学びの多様化学校（旧：不登校特例校）とは</div>
            <div className="qtext">
              不登校の子どもの実態に配慮して、文部科学省から特別な教育課程を組むことを認められた学校・分校・分教室・コースです。通常の学校より授業時間を少なくしたり、体験活動を増やしたりと、学校ごとに柔軟な形で学べます。全国で{MANABI_TAYOUKA_GAKKO.length}校（本校・分校・分教室・コース指定を含む）が指定されています（{new Date().getFullYear()}年時点の文部科学省公表情報）。
            </div>
            <div className="muted" style={{ fontSize: 12 }}>
              入学には学区・転校手続き・面談など各校ごとの条件があります。気になる学校が見つかったら、まずは学校または教育委員会に直接お問い合わせください。
            </div>
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>都道府県から探す</div>
            <div className="chip-row chip-row-wrap">
              {PREFECTURES.map((p) => {
                const count = prefectureCount(p);
                return (
                  <Link
                    key={p}
                    href={`/gakko?pref=${encodeURIComponent(p)}`}
                    className={`chip chip-tag${selected === p ? ' active' : ''}`}
                    style={{
                      textDecoration: 'none',
                      display: 'inline-block',
                      opacity: count > 0 ? 1 : 0.55,
                    }}
                  >
                    {p}{count > 0 ? `（${count}）` : ''}
                  </Link>
                );
              })}
            </div>
          </div>

          {selected && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>{selected}の学びの多様化学校</div>
              {schools.length === 0 ? (
                <div className="muted">
                  現時点で{selected}には指定校がありません。指定校は年々増えているため、今後追加される可能性があります。下記の文部科学省の最新一覧もあわせてご確認ください。
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                  {schools.map((s) => (
                    <div
                      key={s.no}
                      style={{ borderBottom: '1px solid var(--border)', paddingBottom: 10 }}
                    >
                      <div className="qtext" style={{ fontWeight: 700 }}>
                        {s.name}
                        {s.branchName ? `（${s.branchName}）` : ''}
                      </div>
                      <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                        {s.city}・{s.schoolType}・{s.publicPrivate}・{s.type}・{s.designatedYear}指定
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <a
            href={MEXT_SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="card"
            style={{ alignItems: 'flex-start', gap: 10, textDecoration: 'none' }}
          >
            <div className="answer-label" style={{ fontSize: 14 }}>文部科学省の最新の指定校一覧を見る</div>
            <div className="qtext">
              このページのデータは文部科学省の公表情報をもとにしています。最新の指定状況や各校の詳しい案内は文部科学省のページでご確認ください。
            </div>
            <div className="muted" style={{ alignSelf: 'flex-end', fontWeight: 700, color: 'var(--orange-text)' }}>
              文部科学省のページへ ›
            </div>
          </a>

          <Link href="/ask" className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>進路のことを相談してみませんか？</div>
            <div className="qtext">
              学びの多様化学校が合うかどうかも含め、今のお子さんの状況からどうする先生が一緒に考えます。登録不要・匿名で利用できます。
            </div>
            <div className="muted" style={{ alignSelf: 'flex-end', fontWeight: 700, color: 'var(--orange-text)' }}>
              相談するページへ ›
            </div>
          </Link>
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
