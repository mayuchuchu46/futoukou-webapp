import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import RelatedConsultations from '../RelatedConsultations';
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
import MatomeTypeFilter, { MatomeSection } from './MatomeTypeFilter';

// 「学校以外の学びの場・居場所」を都道府県で1回選べば、6カテゴリすべての該当件数・
// 一覧をその場で見られるまとめページ（2026-10-21追加）。
//
// 変遷：
// 1. 最初はカテゴリの説明と各タブへのリンクだけを並べたページだった。
// 2. 「一括で探せるUIがいい」との指摘を受け、都道府県を選ぶと6カテゴリ分の
//    一覧がこのページの中に全部表示される形に変更した。
// 3. 「種類で探すのもあるといい」との指摘を受け、各タブへ飛ぶリンク一覧
//    （「種類で探す」カード）を追加した。
// 4. 「オンラインフリースクールだけ一覧なのもどうなんだろ、もっと最適な
//    プロのUIを」との指摘を受け、(3)のリンク一覧（押すとページ遷移する点が
//    (2)の「その場で全部見られる」と挙動が揃っていなかった）を撤去し、
//    代わりにその場でカテゴリの表示・非表示を切り替えられる「種類で絞り込む」
//    チップ（MatomeTypeFilter、クライアント側トグル）に統合した。オンライン
//    フリースクールも、本来の/gakko?type=onlineタブと同じ3分類（仲間づくり・
//    学習サポート中心・紹介制）で見出し分けして表示するようにした。
//
// 各カテゴリのさらに詳しい絞り込み（学校種など）は/gakkoの各タブ側に残し、
// このページは「全部をまとめて見る」専用の入口として位置づけている。
const PAGE_TITLE = `学校以外の学びの場・居場所を都道府県からまとめて探す｜${SITE_NAME}`;
const PAGE_DESCRIPTION =
  '不登校のお子さんが学校以外に過ごせる場所・学べる場所（学びの多様化学校・フリースクール・教育支援センター・通信制高校・助成金制度・オンラインフリースクール）を、都道府県を選ぶだけでまとめて一覧できます。';

const ONLINE_GROUPS = [
  { key: 'community' as const, title: '仲間づくり・居場所のあるタイプ', desc: '学習だけでなく、交流やイベントなど「居場所」としての機能があるタイプです。' },
  { key: 'tutoring' as const, title: '学習サポート中心（個別指導・家庭教師タイプ）', desc: '交流の場というより、1対1の学習指導が中心のサービスです。' },
  { key: 'referral' as const, title: '利用に条件があるもの', desc: '自治体等からの紹介がないと利用できず、個人が直接申し込めるわけではないものです。' },
];

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

// 都道府県が未選択の時に、場所に依存するカテゴリ（学びの多様化学校・フリースクール・
// 教育支援センター・通信制高校・助成金）の中身に出す案内。オンラインフリースクールだけは
// 居住地を問わないため、この案内の対象外（常に実データを表示）。
function SelectPrefecturePrompt() {
  return <div className="muted">都道府県を選ぶと、ここに一覧が表示されます。</div>;
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

  const sections: MatomeSection[] = [
    {
      key: 'gakko',
      icon: '🏫',
      label: '学びの多様化学校',
      count: gakkoSchools.length,
      node: (
        <details className="card" style={{ padding: 0 }} open>
          <summary style={{ padding: 16, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            🏫 学びの多様化学校（{gakkoSchools.length}件）
          </summary>
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!selected ? (
              <SelectPrefecturePrompt />
            ) : gakkoSchools.length === 0 ? (
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
            {selected && (
              <Link href={`/gakko?pref=${encodeURIComponent(selected)}`} className="muted" style={{ fontSize: 12, textDecoration: 'underline' }}>
                学校種（小学校／中学校／高等学校）で絞り込む ›
              </Link>
            )}
          </div>
        </details>
      ),
    },
    {
      key: 'free',
      icon: '🏠',
      label: 'フリースクール',
      count: freeSchools.length,
      node: (
        <details className="card" style={{ padding: 0 }} open>
          <summary style={{ padding: 16, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            🏠 フリースクール（地域）（{freeSchools.length}件）
          </summary>
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!selected ? (
              <SelectPrefecturePrompt />
            ) : freeCoverage?.tier === 'none' || freeCoverage?.tier === 'unprocessed' ? (
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
      ),
    },
    {
      key: 'shien',
      icon: '🧑‍🏫',
      label: '教育支援センター',
      count: shienCenters.length,
      node: (
        <details className="card" style={{ padding: 0 }} open>
          <summary style={{ padding: 16, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            🧑‍🏫 教育支援センター（{shienCenters.length}件）
          </summary>
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!selected ? (
              <SelectPrefecturePrompt />
            ) : shienCoverage?.tier === 'none' || !shienCoverage ? (
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
      ),
    },
    {
      key: 'tsushin',
      icon: '📮',
      label: '通信制高校',
      count: tsushinSchools.length,
      node: (
        <details className="card" style={{ padding: 0 }} open>
          <summary style={{ padding: 16, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            📮 通信制高校（広域）（{selected ? `本校が${selected}：` : ''}{tsushinSchools.length}件）
          </summary>
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!selected ? (
              <SelectPrefecturePrompt />
            ) : (
              <>
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
              </>
            )}
          </div>
        </details>
      ),
    },
    {
      key: 'josei',
      icon: '💴',
      label: '助成金・支援制度',
      count: joseiSubsidies.length,
      node: (
        <details className="card" style={{ padding: 0 }} open>
          <summary style={{ padding: 16, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            💴 {selected ? `${selected}の助成金・支援制度` : '助成金・支援制度'}（{joseiSubsidies.length}件）
          </summary>
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!selected ? (
              <SelectPrefecturePrompt />
            ) : (
              <>
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
              </>
            )}
          </div>
        </details>
      ),
    },
    {
      key: 'online',
      icon: '💻',
      label: 'オンラインフリースクール',
      count: ONLINE_FREE_SCHOOLS.length,
      node: (
        <details className="card" style={{ padding: 0 }} open>
          <summary style={{ padding: 16, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            💻 オンラインフリースクール（全国どこからでも・{ONLINE_FREE_SCHOOLS.length}件）
          </summary>
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {ONLINE_GROUPS.map((group) => {
              const items = ONLINE_FREE_SCHOOLS.filter((s) => s.category === group.key);
              if (items.length === 0) return null;
              return (
                <div key={group.key}>
                  <div className="qtext" style={{ fontWeight: 700, fontSize: 13 }}>{group.title}</div>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>{group.desc}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {items.map((s) => (
                      <a
                        key={s.name}
                        href={`/out?to=${encodeURIComponent(s.url)}&id=${encodeURIComponent(s.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'block', borderTop: '1px solid var(--border)', paddingTop: 10, textDecoration: 'none', color: 'inherit' }}
                      >
                        <div className="qtext" style={{ fontWeight: 700 }}>{s.name}</div>
                        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                          {s.operator}・対象：{s.ageRange}
                        </div>
                        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{s.note}</div>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </details>
      ),
    },
  ];

  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <Link href="/" className="backlink" style={{ margin: '14px 0' }}>← もどる</Link>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>学校以外の学びの場・居場所まとめ</div>
            <div className="qtext">
              都道府県を選ぶと、学びの多様化学校・フリースクール・教育支援センター・通信制高校・助成金制度を一度にまとめて確認できます。下の「種類で絞り込む」チップで、見たいものだけに絞ることもできます。オンラインフリースクールは居住地を問わないため、都道府県の選択に関係なく表示されます。
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

          <MatomeTypeFilter sections={sections} />

          {/* 「学び場についての質問と回答を出したい」との指摘を受けて追加（2026-10-21）。
              lib/searchTags.tsに追加した包括的なテーマ語「学びの場」（フリースクール・
              通信制高校・学びの多様化学校・教育支援センターいずれかに触れる投稿を同義語
              機構で拾う）を使い、/gakkoの各タブと同じ仕組み（RelatedConsultations）で
              実際の相談を表示する。 */}
          <Suspense fallback={null}>
            <RelatedConsultations themeWord="学びの場" />
          </Suspense>

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
