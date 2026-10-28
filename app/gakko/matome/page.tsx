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
import { FREESCHOOL_SUBSIDIES, getFreeschoolSubsidiesByPrefecture } from '@/lib/data/freeschoolSubsidies';
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

// オンラインフリースクールのまとめページ内プレビューは、1グループあたりこの件数まで
// しかチップ表示しない（超過分は「ほかN件」リンクで/gakko?type=onlineへ誘導）。
// 都道府県による絞り込みが効かずここだけ件数が増え続けていく一方なので、今後
// 掲載数が増えてもこのページの縦幅が際限なく伸びないよう上限を設けている
// （2026-10-22追加）。
const ONLINE_PREVIEW_LIMIT = 6;

// 教育支援センターは都道府県によって掲載件数の差が大きく（例：埼玉県は80件超）、
// このまとめページでは絞り込み無しで全件を<details open>のまま描画していたため、
// 件数が多い都道府県を選ぶほど描画量・ページサイズが増え、都道府県切り替えが遅く
// 感じられる一因になっていた（2026-10-28、「都道府県選択しても切り替わるまで
// 時間かかる」との指摘を受けて対応）。オンラインフリースクールと同じ「件数が多い
// ものは上限を設けて以降は専用ページへ誘導する」方式に揃えた。
const SHIEN_PREVIEW_LIMIT = 20;

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
function SelectPrefecturePrompt({ nationwideNote }: { nationwideNote: string }) {
  return (
    <div className="muted">
      {nationwideNote}都道府県を選ぶと、その都道府県に絞った一覧が表示されます。
    </div>
  );
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
  // このデータの出典（東京都生活文化局の資料）自体が「通信教育を行う区域に東京都を含む」
  // 学校の一覧、つまり掲載校は全校すでに東京都在住者を対象にしている。そのため、東京都が
  // 選ばれた場合は本校所在地で絞り込む意味がなく（本校が東京都以外でも東京都在住者は
  // 入学できる、というのがこのリストの掲載条件そのもののため）、他県のような「本校が
  // 東京都にある学校」という絞り込みをすると、本校が東京都認可（＝このリストの対象外）の
  // 学校だけが漏れて常に0件になってしまう（2026-10-27、「東京都で検索して0件はおかしい」
  // との指摘を受けて対応）。東京都選択時は絞り込まず全校を対象にする。
  // 東京都以外は、本校所在地が一致する学校に加えて、campuses（キャンパス・学習センター）に
  // その都道府県が含まれる学校も対象にする（2026-10-27追加、app/gakko/TsushinExplorer.tsx
  // と同じ理由。本校所在地だけで絞り込むと、実際にその都道府県にキャンパスがある学校を
  // 取りこぼすため）。
  const tsushinSchools =
    selected === '東京都'
      ? CORRESPONDENCE_HIGH_SCHOOLS
      : selected
      ? CORRESPONDENCE_HIGH_SCHOOLS.filter(
          (s) => s.prefecture === selected || s.campuses?.some((c) => c.prefecture === selected)
        )
      : [];
  const joseiSubsidies = selected ? getFreeschoolSubsidiesByPrefecture(selected) : [];

  // 都道府県未選択時は「0件」ではなく全国の総数を表示する（2026-10-21、「デフォルトは
  // 全国表示で数入れて、そこから県別に絞り込みの流れが良くない？」との指摘を受けて対応。
  // 以前は未選択時、絞り込み結果の空配列の長さ＝0件がそのまま表示されてしまい、実際には
  // データがあるのに「0件」と誤解を招く表示になっていた）。
  const gakkoCountDisplay = selected ? gakkoSchools.length : MANABI_TAYOUKA_GAKKO.length;
  const freeCountDisplay = selected ? freeSchools.length : FREE_SCHOOLS.length;
  const shienCountDisplay = selected ? shienCenters.length : EDUCATION_SUPPORT_CENTERS.length;
  const tsushinCountDisplay = selected ? tsushinSchools.length : CORRESPONDENCE_HIGH_SCHOOLS.length;
  const joseiCountDisplay = selected ? joseiSubsidies.length : FREESCHOOL_SUBSIDIES.length;

  const sections: MatomeSection[] = [
    {
      key: 'gakko',
      icon: '🏫',
      label: '学びの多様化学校',
      count: gakkoCountDisplay,
      node: (
        <details className="card" style={{ padding: 0 }} open>
          <summary style={{ padding: 16, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            🏫 学びの多様化学校（{selected ? `${gakkoCountDisplay}件` : `全国${gakkoCountDisplay}件`}）
          </summary>
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!selected ? (
              <SelectPrefecturePrompt nationwideNote={`全国に${gakkoCountDisplay}校あります。`} />
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
            <Link href="/gakko" className="muted" style={{ fontSize: 12, textDecoration: 'underline' }}>
              学びの多様化学校のページへ ›
            </Link>
          </div>
        </details>
      ),
    },
    {
      key: 'free',
      icon: '🏠',
      label: 'フリースクール',
      count: freeCountDisplay,
      node: (
        <details className="card" style={{ padding: 0 }} open>
          <summary style={{ padding: 16, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            🏠 フリースクール（地域）（{selected ? `${freeCountDisplay}件` : `全国${freeCountDisplay}件`}）
          </summary>
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!selected ? (
              <SelectPrefecturePrompt nationwideNote={`全国に${freeCountDisplay}件掲載しています。`} />
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
            <Link href="/gakko?type=free" className="muted" style={{ fontSize: 12, textDecoration: 'underline' }}>
              フリースクール（地域）のページへ ›
            </Link>
          </div>
        </details>
      ),
    },
    {
      key: 'shien',
      icon: '🧑‍🏫',
      label: '教育支援センター',
      count: shienCountDisplay,
      node: (
        <details className="card" style={{ padding: 0 }} open>
          <summary style={{ padding: 16, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            🧑‍🏫 教育支援センター（{selected ? `${shienCountDisplay}件` : `全国${shienCountDisplay}件`}）
          </summary>
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!selected ? (
              <SelectPrefecturePrompt nationwideNote={`掲載できている分だけで全国に${shienCountDisplay}件あります（全国約1,873か所のうち一部）。`} />
            ) : shienCoverage?.tier === 'none' || !shienCoverage ? (
              <div className="muted">
                {selected}については、{shienCoverage?.note ?? '都道府県単位でまとめた一覧は見つかりませんでした。'}教育支援センターが無いという意味ではなく、公開情報が見つからなかったということです。お住まいの市区町村にはほぼ必ず設置されています。
              </div>
            ) : shienCenters.length === 0 ? (
              <div className="muted">掲載できる情報が見つかりませんでした。</div>
            ) : (
              <>
                {shienCenters.slice(0, SHIEN_PREVIEW_LIMIT).map((s, i) => (
                  <div key={`${s.city}-${s.name}-${i}`} style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                    <div className="qtext" style={{ fontWeight: 700 }}>{s.name}</div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                      {s.city}
                      {s.address ? `・${s.address}` : ''}
                    </div>
                  </div>
                ))}
                {shienCenters.length > SHIEN_PREVIEW_LIMIT && (
                  <Link
                    href={`/gakko?type=shien&pref=${encodeURIComponent(selected)}`}
                    className="muted"
                    style={{ fontSize: 12, textDecoration: 'underline', borderTop: '1px solid var(--border)', paddingTop: 10 }}
                  >
                    ほか{shienCenters.length - SHIEN_PREVIEW_LIMIT}件を見る ›
                  </Link>
                )}
              </>
            )}
            <Link href="/gakko?type=shien" className="muted" style={{ fontSize: 12, textDecoration: 'underline' }}>
              教育支援センターのページへ ›
            </Link>
          </div>
        </details>
      ),
    },
    {
      key: 'tsushin',
      icon: '📮',
      label: '通信制高校',
      count: tsushinCountDisplay,
      node: (
        <details className="card" style={{ padding: 0 }} open>
          <summary style={{ padding: 16, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            📮 通信制高校（広域）（{selected ? (selected === '東京都' ? `入学できる学校：${tsushinCountDisplay}件` : `${selected}の学校・キャンパス：${tsushinCountDisplay}件`) : `全国${tsushinCountDisplay}件`}）
          </summary>
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!selected ? (
              <SelectPrefecturePrompt nationwideNote={`全国に${tsushinCountDisplay}校あります。`} />
            ) : (
              <>
                <div className="muted" style={{ fontSize: 12 }}>
                  {selected === '東京都'
                    ? // このデータの出典自体が「通信教育を行う区域に東京都を含む」学校の一覧のため、
                      // 掲載校は全校すでに東京都在住者が入学対象（本校の所在地は問わない）。
                      'このデータに載っている学校は、本校の所在地にかかわらず、すべて東京都にお住まいの方が入学の対象になっている「広域」通信制高校です。'
                    : '「広域」通信制高校は本校の都道府県以外からも入学できます。'}
                </div>
                {tsushinSchools.length === 0 ? (
                  <div className="muted">{selected}に本校・キャンパスがある学校は見つかりませんでした。他の都道府県の学校も入学できる場合があります。</div>
                ) : (
                  tsushinSchools.map((s) => {
                    const isCampusOnly = selected !== '東京都' && s.prefecture !== selected;
                    return (
                      <Link
                        key={s.no}
                        href={`/gakko/tsushin/${s.no}`}
                        style={{ display: 'block', borderTop: '1px solid var(--border)', paddingTop: 10, textDecoration: 'none', color: 'inherit' }}
                      >
                        <div className="qtext" style={{ fontWeight: 700 }}>{s.name}</div>
                        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                          {selected === '東京都' ? `本校：${s.prefecture}${s.municipality}・` : ''}設置者：{s.operator}
                          {isCampusOnly && <>　※本校は{s.prefecture}ですが、{selected}にキャンパス・学習センターがあります</>}
                        </div>
                      </Link>
                    );
                  })
                )}
              </>
            )}
            <Link href="/gakko?type=tsushin" className="muted" style={{ fontSize: 12, textDecoration: 'underline' }}>
              通信制高校（広域）のページへ ›
            </Link>
          </div>
        </details>
      ),
    },
    {
      key: 'josei',
      icon: '💴',
      label: '助成金・支援制度',
      count: joseiCountDisplay,
      node: (
        <details className="card" style={{ padding: 0 }} open>
          <summary style={{ padding: 16, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            💴 {selected ? `${selected}の助成金・支援制度` : '助成金・支援制度'}（{selected ? `${joseiCountDisplay}件` : `全国${joseiCountDisplay}件`}）
          </summary>
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!selected ? (
              <SelectPrefecturePrompt nationwideNote={`確認できている制度は全国に${joseiCountDisplay}件あります。`} />
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
            <Link href="/gakko?type=josei" className="muted" style={{ fontSize: 12, textDecoration: 'underline' }}>
              助成金・支援制度のページへ ›
            </Link>
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
        // 他のカテゴリ（学びの多様化学校・フリースクール等）は都道府県を選ぶまでは
        // 中身を「都道府県を選んでください」の一文だけにして縦幅を抑えているが、
        // オンラインフリースクールは全国対応で都道府県による絞り込みが効かないため、
        // 同じ仕組みが使えない。かわりにこのカード自体を閉じた状態から始める（件数は
        // 常にsummaryに出るので一覧性は保ったまま）のと、開いたときも1グループ
        // あたり{ONLINE_PREVIEW_LIMIT}件までのチップ表示＋「もっと見る」導線にして、
        // 今後件数が増えていっても縦幅が青天井に伸びないようにした（2026-10-22、
        // 「いまいち」「数が増えていくことも考えてUI設計したい」との指摘を受けて設計し直し）。
        <details className="card" style={{ padding: 0 }}>
          <summary style={{ padding: 16, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            💻 オンラインフリースクール（全国どこからでも・{ONLINE_FREE_SCHOOLS.length}件）
          </summary>
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {ONLINE_GROUPS.map((group) => {
              const items = ONLINE_FREE_SCHOOLS.filter((s) => s.category === group.key);
              if (items.length === 0) return null;
              const shown = items.slice(0, ONLINE_PREVIEW_LIMIT);
              const hiddenCount = items.length - shown.length;
              return (
                <div key={group.key}>
                  <div className="qtext" style={{ fontWeight: 700, fontSize: 13 }}>{group.title}</div>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>{group.desc}</div>
                  <div className="chip-row chip-row-wrap">
                    {shown.map((s) => (
                      <Link
                        key={s.no}
                        href={`/gakko/online/${s.no}`}
                        className="chip chip-tag"
                        style={{ textDecoration: 'none', display: 'inline-block' }}
                      >
                        {s.name}
                      </Link>
                    ))}
                    {hiddenCount > 0 && (
                      <Link
                        href="/gakko?type=online"
                        className="chip chip-tag"
                        style={{ textDecoration: 'none', display: 'inline-block' }}
                      >
                        ほか{hiddenCount}件 ›
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
            <Link href="/gakko?type=online" className="muted" style={{ fontSize: 12, textDecoration: 'underline' }}>
              オンラインフリースクールのページへ ›
            </Link>
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
          <Link href="/" className="backlink" style={{ margin: '14px 0' }}>‹ もどる</Link>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>学校以外の学びの場・居場所まとめ</div>
            <div className="qtext">
              都道府県を選ぶと、学びの多様化学校・フリースクール・教育支援センター・通信制高校・助成金制度を一度にまとめて確認できます。下の「種類で絞り込む」チップで、見たいものだけに絞ることもできます。オンラインフリースクールは居住地を問わないため、都道府県の選択に関係なく表示されます。
            </div>
          </div>

          {/* 学校詳細ページで保存したお気に入りの一覧への入口（2026-10-22追加）。
              各詳細ページ（/gakko/school等）の保存ボタンで貯めたものをここから見返せる。 */}
          <Link
            href="/gakko/favorites"
            className="card"
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span aria-hidden style={{ fontSize: 16 }}>★</span>
              保存したお気に入りを見る
            </span>
            <span className="muted">›</span>
          </Link>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>{selected ? '都道府県を選び直す' : '都道府県から探す'}</div>
            {/* 以前はこの下にPREFECTURES全47件のチップ一覧も並べていたが、プルダウンと
                内容が完全に重複しており冗長なため削除した（2026-10-22、「ここはプルダウン
                だけでいいかも」との指摘を受けて）。 */}
            <MatomePrefectureSelect selected={selected} />
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
