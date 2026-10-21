import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { PREFECTURES } from '@/lib/data/prefectures';
import { MANABI_TAYOUKA_GAKKO } from '@/lib/data/manabiTayoukaGakko';
import { FREE_SCHOOLS } from '@/lib/data/freeSchools';
import { getFreeSchoolCoverage } from '@/lib/data/freeschoolCoverage';
import { ONLINE_FREE_SCHOOLS } from '@/lib/data/onlineFreeSchools';
import { EDUCATION_SUPPORT_CENTERS } from '@/lib/data/educationSupportCenters';
import { getEducationSupportCoverage } from '@/lib/data/educationSupportCoverage';
import { CORRESPONDENCE_HIGH_SCHOOLS } from '@/lib/data/correspondenceHighSchools';
import { getFreeschoolSubsidiesByPrefecture } from '@/lib/data/freeschoolSubsidies';
import MatomePrefectureSelect from './MatomePrefectureSelect';

// 「学校以外の学びの場・居場所」を都道府県で1回選べば、6カテゴリすべての該当件数・
// 一覧をその場で見られるまとめページ（2026-10-21追加）。
//
// 最初はカテゴリの説明と各タブへのリンクだけを並べたページとして作ったが、
// 「こんな感じより、ここに来たら一括で探せるUIがいい」との指摘を受けて、
// 都道府県を選ぶと6カテゴリ分の一覧がこのページの中に全部表示される形に変更した。
// 各カテゴリの詳しい一覧・絞り込み（学校種など）は/gakkoの各タブ側に残し、
// このページは「全部をまとめて見る」入口として位置づけている。
//
// オンラインフリースクールだけは居住地を問わず利用できるため、都道府県の選択に
// 関係なく常に表示する（/gakkoのtype=online・type=freeと同じ考え方）。
const PAGE_TITLE = `学校以外の学びの場・居場所を都道府県からまとめて探す｜${SITE_NAME}`;
const PAGE_DESCRIPTION =
  '不登校のお子さんが学校以外に過ごせる場所・学べる場所（学びの多様化学校・フリースクール・教育支援センター・通信制高校・助成金制度・オンラインフリースクール）を、都道府県を選ぶだけでまとめて一覧できます。';

export async function generateMetadata(): Promise<Metadata> {
  const url = `${SITE_URL}/gakko/matome`;
  return {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    alternates: { canonical: url },
    openGraph: {
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      url,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: PAGE_TITLE }],
    },
    twitter: {
      card: 'summary_large_image',
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      images: ['/og-image.png'],
    },
  };
}

export default async function GakkoMatomePage({
  searchParams,
}: {
  searchParams: Promise<{ pref?: string }>;
}) {
  const { pref } = await searchParams;
  const selected = pref && PREFECTURES.includes(pref) ? pref : null;

  const gakkoSchools = selected ? MANABI_TAYOUKA_GAKKO.filter((s) => s.prefecture === selected) : [];
  const freeSchools = selected ? FREE_SCHOOLS.filter((s) => s.prefecture === selected) : [];
  const freeCoverage = selected ? getFreeSchoolCoverage(selected) : undefined;
  const shienCenters = selected ? EDUCATION_SUPPORT_CENTERS.filter((s) => s.prefecture === selected) : [];
  const shienCoverage = selected ? getEducationSupportCoverage(selected) : undefined;
  const tsushinSchools = selected ? CORRESPONDENCE_HIGH_SCHOOLS.filter((s) => s.prefecture === selected) : [];
  const joseiSubsidies = selected ? getFreeschoolSubsidiesByPrefecture(selected) : [];

  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <Link href="/" className="backlink" style={{ margin: '14px 0' }}>← もどる</Link>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>学校以外の学びの場・居場所まとめ</div>
            <div className="qtext">
              都道府県を選ぶと、学びの多様化学校・フリースクール・教育支援センター・通信制高校・助成金制度を一度にまとめて確認できます（オンラインフリースクールは居住地を問わないため常に表示しています）。
            </div>
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>{selected ? '都道府県を選び直す' : '都道府県から探す'}</div>
            <MatomePrefectureSelect selected={selected} />
            <div className="chip-row chip-row-wrap">
              {PREFECTURES.map((p) => (
                <Link
                  key={p}
                  href={`/gakko/matome?pref=${encodeURIComponent(p)}`}
                  className={`chip chip-tag${selected === p ? ' active' : ''}`}
                  style={{ textDecoration: 'none', display: 'inline-block' }}
                >
                  {p}
                </Link>
              ))}
            </div>
          </div>

          {selected && (
            <>
              <details className="card" style={{ padding: 0 }} open>
                <summary style={{ padding: 16, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                  🏫 学びの多様化学校（{gakkoSchools.length}件）
                </summary>
                <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {gakkoSchools.length === 0 ? (
                    <div className="muted">{selected}に文部科学省指定の学びの多様化学校は見つかりませんでした。</div>
                  ) : (
                    gakkoSchools.map((s) => (
                      <Link
                        key={s.no}
                        href={`/gakko/school/${s.no}`}
                        style={{ display: 'block', borderTop: '1px solid var(--border)', paddingTop: 10, textDecoration: 'none', color: 'inherit' }}
                      >
                        <div className="qtext" style={{ fontWeight: 700 }}>
                          {s.name}{s.branchName ? `（${s.branchName}）` : ''}
                        </div>
                        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                          {s.city}・{s.schoolType}・{s.publicPrivate}
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </details>

              <details className="card" style={{ padding: 0 }} open>
                <summary style={{ padding: 16, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                  🏠 フリースクール（地域）（{freeSchools.length}件）
                </summary>
                <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {freeCoverage?.tier === 'none' || freeCoverage?.tier === 'unprocessed' ? (
                    <div className="muted">
                      {selected}については、{freeCoverage.note}フリースクールが無いという意味ではなく、公開された一覧が見つからなかったということです。
                    </div>
                  ) : freeSchools.length === 0 ? (
                    <div className="muted">掲載できる情報が見つかりませんでした。</div>
                  ) : (
                    freeSchools.map((s) => (
                      <Link
                        key={s.no}
                        href={`/gakko/free/${s.no}`}
                        style={{ display: 'block', borderTop: '1px solid var(--border)', paddingTop: 10, textDecoration: 'none', color: 'inherit' }}
                      >
                        <div className="qtext" style={{ fontWeight: 700 }}>{s.name}</div>
                        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                          {s.city}
                          {s.address ? `・${s.address}` : ''}
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </details>

              <details className="card" style={{ padding: 0 }} open>
                <summary style={{ padding: 16, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                  🧑‍🏫 教育支援センター（{shienCenters.length}件）
                </summary>
                <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {shienCoverage?.tier === 'none' || !shienCoverage ? (
                    <div className="muted">
                      {selected}については、{shienCoverage?.note ?? '都道府県単位でまとめた一覧は見つかりませんでした。'}教育支援センターが無いという意味ではなく、公開情報が見つからなかったということです。お住まいの市区町村にはほぼ必ず設置されています。
                    </div>
                  ) : shienCenters.length === 0 ? (
                    <div className="muted">掲載できる情報が見つかりませんでした。</div>
                  ) : (
                    shienCenters.map((s, i) => (
                      <div key={`${s.city}-${s.name}-${i}`} style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                        <div className="qtext" style={{ fontWeight: 700 }}>{s.name}</div>
                        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                          {s.city}
                          {s.address ? `・${s.address}` : ''}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </details>

              <details className="card" style={{ padding: 0 }} open>
                <summary style={{ padding: 16, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                  📮 通信制高校（広域）（本校が{selected}：{tsushinSchools.length}件）
                </summary>
                <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="muted" style={{ fontSize: 12 }}>
                    「広域」通信制高校は本校の都道府県以外からも入学できます。
                  </div>
                  {tsushinSchools.length === 0 ? (
                    <div className="muted">本校が{selected}にある学校は見つかりませんでした。他の都道府県の学校も入学できる場合があります。</div>
                  ) : (
                    tsushinSchools.map((s) => (
                      <Link
                        key={s.no}
                        href={`/gakko/tsushin/${s.no}`}
                        style={{ display: 'block', borderTop: '1px solid var(--border)', paddingTop: 10, textDecoration: 'none', color: 'inherit' }}
                      >
                        <div className="qtext" style={{ fontWeight: 700 }}>{s.name}</div>
                        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>設置者：{s.operator}</div>
                      </Link>
                    ))
                  )}
                </div>
              </details>

              <details className="card" style={{ padding: 0 }} open>
                <summary style={{ padding: 16, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                  💴 {selected}の助成金・支援制度（{joseiSubsidies.length}件）
                </summary>
                <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="muted" style={{ fontSize: 12 }}>
                    通信制高校の学費は国の「高等学校等就学支援金」が対象です（全国統一の制度のため一覧には含みません）。下記はフリースクール等の利用料を独自に助成する自治体の制度です。
                  </div>
                  {joseiSubsidies.length === 0 ? (
                    <div className="muted">{selected}については、Web検索で確認できる利用料助成制度が見つかりませんでした。制度が無いという意味ではありません。</div>
                  ) : (
                    joseiSubsidies.map((s, i) => (
                      <div key={`${s.entity}-${s.name}-${i}`} style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                        <div className="qtext" style={{ fontWeight: 700 }}>{s.name}</div>
                        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                          実施主体：{s.entity}{s.entityLevel === 'city' ? '（市区町村独自の制度）' : ''}
                        </div>
                        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{s.summary}</div>
                      </div>
                    ))
                  )}
                </div>
              </details>
            </>
          )}

          <details className="card" style={{ padding: 0 }} open={!selected}>
            <summary style={{ padding: 16, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
              💻 オンラインフリースクール（全国どこからでも・{ONLINE_FREE_SCHOOLS.length}件）
            </summary>
            <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ONLINE_FREE_SCHOOLS.map((s, i) => (
                <a
                  key={`${s.name}-${i}`}
                  href={`/out?to=${encodeURIComponent(s.url)}&id=${encodeURIComponent(s.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'block', borderTop: '1px solid var(--border)', paddingTop: 10, textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="qtext" style={{ fontWeight: 700 }}>{s.name}</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                    {s.operator}・対象：{s.ageRange}
                  </div>
                </a>
              ))}
            </div>
          </details>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>どれが合うか迷ったら</div>
            <div className="qtext">
              種類ごとの違いだけでは判断しづらいことも多いです。今のお子さんの状況を伝えていただければ、どうする先生が一緒に考えます。登録不要・匿名で利用できます。
            </div>
            <Link href="/ask" className="btn-primary sidebar-ask-btn-pink" style={{ textDecoration: 'none', width: '100%', textAlign: 'center' }}>
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
