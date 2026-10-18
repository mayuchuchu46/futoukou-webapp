import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { MANABI_TAYOUKA_GAKKO, MEXT_SOURCE_URL } from '@/lib/data/manabiTayoukaGakko';
import { FREE_SCHOOLS } from '@/lib/data/freeSchools';
import { FREE_SCHOOL_COVERAGE, getFreeSchoolCoverage } from '@/lib/data/freeschoolCoverage';
import { ONLINE_FREE_SCHOOLS } from '@/lib/data/onlineFreeSchools';
import { EDUCATION_SUPPORT_CENTERS } from '@/lib/data/educationSupportCenters';
import { EDUCATION_SUPPORT_COVERAGE, getEducationSupportCoverage } from '@/lib/data/educationSupportCoverage';
import {
  CORRESPONDENCE_HIGH_SCHOOLS,
  CORRESPONDENCE_HIGH_SCHOOL_SOURCE_URL,
  CORRESPONDENCE_HIGH_SCHOOL_AS_OF,
} from '@/lib/data/correspondenceHighSchools';
import { FREESCHOOL_SUBSIDIES, getFreeschoolSubsidiesByPrefecture } from '@/lib/data/freeschoolSubsidies';
import { PREFECTURES } from '@/lib/data/prefectures';
import PrefectureSelect from './PrefectureSelect';

// 「学びの多様化学校」（旧：不登校特例校）と「フリースクール（民間施設）」の
// 全国検索ページ。前者は文部科学省の指定校一覧（MANABI_TAYOUKA_GAKKO）を、
// 後者は都道府県・市区町村教育委員会等が個別に公開している一覧を手動で収集した
// FREE_SCHOOLSを都道府県で絞り込んで表示する（2026-10-18、フリースクールタブ追加）。
//
// 学びの多様化学校と違い、フリースクールには全国統一の公的データベースが存在しないため、
// 都道府県によって「住所・連絡先つきの一覧あり」「市区町村単位のみ」「公開リストなし」が
// 混在する。この網羅状況の差は freeschoolCoverage.ts で管理し、ページ上でも
// 正直に（データがない都道府県には「ありません」と）表示する。
//
// データはいずれも公的機関の公開情報で著作権上の問題がなく、更新頻度も低いため、
// Supabaseにテーブルを作らずアプリ内の静的データとして持つ（「時間をかけたくない」との
// 方針に合わせた最小実装）。
const GAKKO_TITLE = `学びの多様化学校・フリースクールを都道府県から探す｜${SITE_NAME}`;
const GAKKO_DESCRIPTION =
  '不登校の子どもに合わせた「学びの多様化学校」（旧：不登校特例校）や、民間の「フリースクール」（地域・オンライン）を探せます。文部科学省や教育委員会等の公開情報をもとに掲載しています。';

export const metadata: Metadata = {
  title: GAKKO_TITLE,
  description: GAKKO_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/gakko` },
  openGraph: {
    title: GAKKO_TITLE,
    description: GAKKO_DESCRIPTION,
    url: `${SITE_URL}/gakko`,
    images: [
      {
        url: '/og-image-gakko.jpg',
        width: 1200,
        height: 630,
        alt: GAKKO_TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: GAKKO_TITLE,
    description: GAKKO_DESCRIPTION,
    images: ['/og-image-gakko.jpg'],
  },
};

function gakkoCount(pref: string) {
  return MANABI_TAYOUKA_GAKKO.filter((s) => s.prefecture === pref).length;
}

function freeSchoolCount(pref: string) {
  return FREE_SCHOOLS.filter((s) => s.prefecture === pref).length;
}

function shienCount(pref: string) {
  return EDUCATION_SUPPORT_CENTERS.filter((s) => s.prefecture === pref).length;
}

function tsushinCount(pref: string) {
  return CORRESPONDENCE_HIGH_SCHOOLS.filter((s) => s.prefecture === pref).length;
}

function joseiCount(pref: string) {
  return FREESCHOOL_SUBSIDIES.filter((s) => s.prefecture === pref).length;
}

export default async function GakkoPage({
  searchParams,
}: {
  searchParams: Promise<{ pref?: string; type?: string }>;
}) {
  const { pref, type: rawType } = await searchParams;
  // 2026-10-18: オンラインフリースクールが21件まで増え、フリースクール（地域）タブに
  // 常に埋め込むと情報量が多すぎたため、「オンラインフリースクール」を独立した
  // 3つめのタブに分離した。
  // 同日、公的・無料の「教育支援センター（適応指導教室）」情報を4つめのタブ（shien）
  // として追加。さらに同日、広域通信制高校（私立中心）を5つめのタブ（tsushin）として
  // 追加した。通信制高校は「広域」＝居住地を問わず入学できるが、本校所在地の都道府県で
  // も絞り込めるようにしている（未選択時は全115校を表示）。
  // 同日、「助成金情報もみんな知りたいよね」との指摘を受け、フリースクール等の利用料
  // 助成（自治体ごと）・就学支援金（国の制度）の情報を6つめのタブ（josei）として追加。
  // 利用料助成は居住地（自治体）に紐づくため、学びの多様化学校等と同様に都道府県で
  // 絞り込める形にした。
  const type: 'gakko' | 'free' | 'online' | 'shien' | 'tsushin' | 'josei' =
    rawType === 'free'
      ? 'free'
      : rawType === 'online'
        ? 'online'
        : rawType === 'shien'
          ? 'shien'
          : rawType === 'tsushin'
            ? 'tsushin'
            : rawType === 'josei'
              ? 'josei'
              : 'gakko';
  const selected = pref && PREFECTURES.includes(pref) ? pref : null;
  const schools = selected ? MANABI_TAYOUKA_GAKKO.filter((s) => s.prefecture === selected) : [];
  const freeSchools = selected ? FREE_SCHOOLS.filter((s) => s.prefecture === selected) : [];
  const coverage = selected ? getFreeSchoolCoverage(selected) : undefined;
  const shienCenters = selected ? EDUCATION_SUPPORT_CENTERS.filter((s) => s.prefecture === selected) : [];
  const shienCoverage = selected ? getEducationSupportCoverage(selected) : undefined;
  const tsushinSchools = selected
    ? CORRESPONDENCE_HIGH_SCHOOLS.filter((s) => s.prefecture === selected)
    : CORRESPONDENCE_HIGH_SCHOOLS;
  const joseiSubsidies = selected ? getFreeschoolSubsidiesByPrefecture(selected) : [];
  const typeQueryPrefix =
    type === 'free'
      ? 'type=free&'
      : type === 'shien'
        ? 'type=shien&'
        : type === 'tsushin'
          ? 'type=tsushin&'
          : type === 'josei'
            ? 'type=josei&'
            : '';
  const prefHref = (p: string) => `/gakko?${typeQueryPrefix}pref=${encodeURIComponent(p)}`;

  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <Link href="/" className="backlink" style={{ margin: '14px 0' }}>← もどる</Link>

          {/* 学校探しの入口を1ページに統合したので、冒頭でタブを切り替えられるようにした
              （2026-10-18）。都道府県の選択はタブを切り替えても保持する。
              6タブになり1行のチップ列では種類が分かりにくかったため、「お住まいの地域で
              探す（都道府県の選択が前提）」「全国どこからでも選べる（居住地を問わない）」
              「助成金・支援制度」の3グループに分けて見出しつきで表示する（2026-10-18、
              助成金タブは「学校・施設を探す」とは性質が違うとの指摘を受け独立したグループ
              にした）。 */}
          <div className="muted" style={{ fontSize: 11, margin: '0 0 2px', fontWeight: 700 }}>お住まいの地域で探す</div>
          <div className="chip-row chip-row-wrap" style={{ margin: '0 0 8px' }}>
            <Link
              href={selected ? `/gakko?pref=${encodeURIComponent(selected)}` : '/gakko'}
              className={`chip chip-tag${type === 'gakko' ? ' active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              学びの多様化学校
            </Link>
            <Link
              href={selected ? `/gakko?type=free&pref=${encodeURIComponent(selected)}` : '/gakko?type=free'}
              className={`chip chip-tag${type === 'free' ? ' active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              フリースクール
            </Link>
            <Link
              href={selected ? `/gakko?type=shien&pref=${encodeURIComponent(selected)}` : '/gakko?type=shien'}
              className={`chip chip-tag${type === 'shien' ? ' active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              教育支援センター
            </Link>
          </div>
          <div className="muted" style={{ fontSize: 11, margin: '0 0 2px', fontWeight: 700 }}>全国どこからでも選べる</div>
          <div className="chip-row chip-row-wrap" style={{ margin: '0 0 8px' }}>
            <Link
              href="/gakko?type=online"
              className={`chip chip-tag${type === 'online' ? ' active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              オンラインフリースクール
            </Link>
            <Link
              href={selected ? `/gakko?type=tsushin&pref=${encodeURIComponent(selected)}` : '/gakko?type=tsushin'}
              className={`chip chip-tag${type === 'tsushin' ? ' active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              通信制高校（広域）
            </Link>
          </div>
          <div className="muted" style={{ fontSize: 11, margin: '0 0 2px', fontWeight: 700 }}>助成金・支援制度を調べる</div>
          <div className="chip-row chip-row-wrap" style={{ margin: '0 0 4px' }}>
            <Link
              href={selected ? `/gakko?type=josei&pref=${encodeURIComponent(selected)}` : '/gakko?type=josei'}
              className={`chip chip-tag${type === 'josei' ? ' active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              助成金・支援制度
            </Link>
          </div>
          {type === 'gakko' && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>学びの多様化学校（旧：不登校特例校）とは</div>
              <div className="qtext">
                不登校の子どもの実態に配慮して、文部科学省から特別な教育課程を組むことを認められた学校・分校・分教室・コースです。通常の学校より授業時間を少なくしたり、体験活動を増やしたりと、学校ごとに柔軟な形で学べます。全国で{MANABI_TAYOUKA_GAKKO.length}校（本校・分校・分教室・コース指定を含む）が指定されています（{new Date().getFullYear()}年時点の文部科学省公表情報）。
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                入学には学区・転校手続き・面談など各校ごとの条件があります。気になる学校が見つかったら、まずは学校または教育委員会に直接お問い合わせください。
              </div>
            </div>
          )}

          {type === 'free' && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>フリースクール（地域）とは</div>
              <div className="qtext">
                学校以外の場所で過ごしたり学んだりできる、お住まいの地域にある民間の施設です。学びの多様化学校（MEXT指定校）と違い、フリースクールには全国を網羅した公的なリストが存在しません。このページでは、都道府県や市区町村の教育委員会等が公開している一覧をもとに、見つかった範囲で掲載しています。
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                都道府県によって、情報が充実している所もあれば、公開されたリストが見つからなかった所もあります。お住まいの地域が「見つかりませんでした」と表示される場合でも、フリースクール自体が無いとは限りません。お近くの教育委員会の相談窓口に直接お問い合わせいただくことをおすすめします。通える範囲に見つからない場合は、
                <Link href="/gakko?type=online" style={{ textDecoration: 'underline' }}>オンラインフリースクール</Link>
                も選択肢になります。
              </div>
            </div>
          )}

          {type === 'online' && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>オンラインフリースクールとは</div>
              <div className="qtext">
                インターネット経由で参加できる、お住まいの地域を問わず利用できるフリースクール・学習支援サービスです。お住まいの地域に通えるフリースクールが見つからない場合の選択肢になります。都道府県の選択は不要です。
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                件数が多いため、下記で「仲間づくり・居場所のあるタイプ」「学習サポート中心のタイプ」「利用に条件があるタイプ」に分けて掲載しています。
              </div>
            </div>
          )}

          {type === 'shien' && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>教育支援センター（適応指導教室）とは</div>
              <div className="qtext">
                市区町村教育委員会が設置している、公的で無料の不登校支援施設です。フリースクールのような民間施設とは異なり、ほぼすべての市区町村に1つずつ設置されています（全国で約1,873か所、文部科学省・令和6年度調査）。学校に戻ることだけを目的とせず、個別のペースで過ごしたり学んだりできる場です。
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                利用には在籍校・教育委員会を通じた申込みが必要な場合が多いため、まずはお子さんの学校またはお住まいの教育委員会にお問い合わせください。
              </div>
            </div>
          )}

          {type === 'tsushin' && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>通信制高校（広域）とは</div>
              <div className="qtext">
                レポート提出やスクーリング（面接指導）を中心に学び、高校卒業資格を取得できる正式な高等学校です。「広域」通信制高校は本校の都道府県以外からも入学できるため、お住まいの地域にかかわらず選択肢になります。全日制と違い、本人のペースに合わせて通学頻度や学び方を選べる学校が多いです。
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                学費・カリキュラム・通学（キャンパス／サポート校）の有無は学校ごとに大きく異なります。このリストには個別のキャンパス所在地や公式サイトURLは含まれていないため、気になる学校が見つかったら学校名で検索し、公式サイトで必ず確認してください。
              </div>
            </div>
          )}

          {type === 'josei' && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>助成金・支援制度とは</div>
              <div className="qtext">
                フリースクール等の利用料は原則自己負担ですが、国の「高等学校等就学支援金」（通信制高校等が対象）のほか、一部の都道府県・市区町村では、フリースクール等の利用料の一部を助成する制度を独自に設けています。
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                利用料助成は自治体ごとに有無・条件・金額が大きく異なり、全国を網羅した公的な一覧も存在しません。下記はWeb検索で確認できた範囲の制度で、掲載が無い地域でも制度が存在する可能性があります。お住まいの市区町村教育委員会に直接ご確認ください。
              </div>
            </div>
          )}

          {type === 'josei' && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>国の制度：高等学校等就学支援金</div>
              <div className="qtext">
                高校・通信制高校等に進学した場合、世帯の状況に応じて授業料の一部または全部を国が支援する全国統一の制度です。対象や支給額は入学した年度・学校の種類（公立／私立）によって仕組みが分かれており、ここで具体的な金額をお伝えすると古い情報になってしまう可能性があるため、詳しい内容は文部科学省の公式ページで直接ご確認ください。
              </div>
              <a
                href="https://www.mext.go.jp/a_menu/shotou/mushouka/index.htm"
                target="_blank"
                rel="noopener noreferrer"
                className="muted"
                style={{ fontSize: 12, textDecoration: 'underline' }}
              >
                文部科学省「高等学校等就学支援金制度」のページへ ›
              </a>
            </div>
          )}

          {/* 選んだ都道府県の結果は、47都道府県ぶんのチップ一覧より前に出す。以前はチップの
              下にあり、選んだ直後でも長いチップの壁をスクロールしないと結果が見えなかった
              （特にスマホで顕著）。選択済みの時はここに結果を先出しし、下の選択UIは
              「選び直す」ためのものとして後に続ける構成にした（2026-10-18）。 */}
          {selected && type === 'gakko' && (
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

          {selected && type === 'free' && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>{selected}のフリースクール</div>
              {coverage?.tier === 'none' || coverage?.tier === 'unprocessed' ? (
                <div className="muted">
                  {selected}については、{coverage.note}フリースクールが無いという意味ではなく、公開された一覧が見つからなかったということです。お近くの教育委員会やスクールカウンセラーに直接お問い合わせください。
                </div>
              ) : freeSchools.length === 0 ? (
                <div className="muted">掲載できる情報が見つかりませんでした。</div>
              ) : (
                <>
                  {coverage && (
                    <div className="muted" style={{ fontSize: 12 }}>
                      ※ {coverage.note} すべてのフリースクールを網羅したものではありません。
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                    {freeSchools.map((s) => (
                      <div
                        key={s.no}
                        style={{ borderBottom: '1px solid var(--border)', paddingBottom: 10 }}
                      >
                        <div className="qtext" style={{ fontWeight: 700 }}>{s.name}</div>
                        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                          {s.city}
                          {s.address ? `・${s.address}` : ''}
                          {s.contact ? `・${s.contact}` : ''}
                          {s.ageRange && s.ageRange !== '記載なし' ? `・対象：${s.ageRange}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                  <a
                    href={freeSchools[0].sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="muted"
                    style={{ fontSize: 12, textDecoration: 'underline' }}
                  >
                    出典を見る ›
                  </a>
                </>
              )}
            </div>
          )}

          {selected && type === 'shien' && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>{selected}の教育支援センター</div>
              {shienCoverage?.tier === 'none' || !shienCoverage ? (
                <div className="muted">
                  {selected}については、{shienCoverage?.note ?? '都道府県単位でまとめた一覧は見つかりませんでした。'}教育支援センターが無いという意味ではなく、都道府県単位で一覧化した公開情報が見つからなかったということです。お住まいの市区町村にはほぼ必ず設置されているため、お子さんの学校またはお住まいの教育委員会に直接お問い合わせください。
                </div>
              ) : shienCenters.length === 0 ? (
                <div className="muted">掲載できる情報が見つかりませんでした。</div>
              ) : (
                <>
                  <div className="muted" style={{ fontSize: 12 }}>
                    ※ {shienCoverage.note} すべての施設・自治体を網羅したものではありません。
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                    {shienCenters.map((s, i) => (
                      <div
                        key={`${s.city}-${s.name}-${i}`}
                        style={{ borderBottom: '1px solid var(--border)', paddingBottom: 10 }}
                      >
                        <div className="qtext" style={{ fontWeight: 700 }}>{s.name}</div>
                        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                          {s.city}
                          {s.address ? `・${s.address}` : ''}
                          {s.contact ? `・${s.contact}` : ''}
                        </div>
                        {s.note && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{s.note}</div>}
                      </div>
                    ))}
                  </div>
                  <a
                    href={shienCenters[0].sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="muted"
                    style={{ fontSize: 12, textDecoration: 'underline' }}
                  >
                    出典を見る ›
                  </a>
                </>
              )}
            </div>
          )}

          {/* オンラインフリースクールは居住地を問わず利用できるため、独立タブ（type=online）
              として表示する。以前はフリースクール（地域）タブの中に常時埋め込んでいたが、
              21件まで増えて情報量が多すぎたため、2026-10-18に分離した。 */}
          {type === 'online' && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              {/* 件数が21件まで増えたため、性質（仲間づくりのある学校タイプ／学習サポート中心／
                  紹介制で利用に条件がある）で見出しを分けて表示する（2026-10-18）。 */}
              {([
                { key: 'community' as const, title: '仲間づくり・居場所のあるオンラインスクール', desc: '学習だけでなく、交流やイベントなど「居場所」としての機能があるタイプです。' },
                { key: 'tutoring' as const, title: '学習サポート中心（個別指導・家庭教師タイプ）', desc: '交流の場というより、1対1の学習指導が中心のサービスです。' },
                { key: 'referral' as const, title: '利用に条件があるもの', desc: '自治体等からの紹介がないと利用できず、個人が直接申し込めるわけではないものです。' },
              ]).map((group) => {
                const items = ONLINE_FREE_SCHOOLS.filter((s) => s.category === group.key);
                if (items.length === 0) return null;
                return (
                  <div key={group.key} style={{ width: '100%' }}>
                    <div className="qtext" style={{ fontWeight: 700, fontSize: 13, marginTop: 6 }}>{group.title}</div>
                    <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>{group.desc}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                      {items.map((s) => (
                        <a
                          key={s.name}
                          href={`/out?to=${encodeURIComponent(s.url)}&id=${encodeURIComponent(s.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'block', borderBottom: '1px solid var(--border)', paddingBottom: 10, textDecoration: 'none', color: 'inherit' }}
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
          )}

          {/* 通信制高校（広域）は居住地を問わず入学できるが、学びの多様化学校タブと同様に
              「本校所在地」の都道府県を選んでから一覧を見る形にする（2026-10-18、未選択時は
              一覧を出さずチップ選択を促す。以前は未選択時に全115校を表示していたが、
              わかりにくいとの指摘で変更）。 */}
          {selected && type === 'tsushin' && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>本校が{selected}にある通信制高校</div>
              <div className="muted" style={{ fontSize: 12 }}>
                「広域」の通信制高校は本校の都道府県以外からも入学できます。{selected}の学校が見つからない、または少ない場合も、他の都道府県の学校が選択肢になります。
              </div>
              {tsushinSchools.length === 0 ? (
                <div className="muted">{selected}に本校がある学校は見つかりませんでした。上記の通り、他の都道府県の学校も入学できる場合があります。</div>
              ) : (
                <>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {CORRESPONDENCE_HIGH_SCHOOL_AS_OF}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                    {tsushinSchools.map((s) => (
                      <div
                        key={s.no}
                        style={{ borderBottom: '1px solid var(--border)', paddingBottom: 10 }}
                      >
                        <div className="qtext" style={{ fontWeight: 700 }}>{s.name}</div>
                        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                          本校：{s.prefecture}{s.municipality ? `${s.municipality}` : ''}・設置者：{s.operator}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
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
          )}

          {selected && type === 'josei' && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>{selected}の利用料助成制度</div>
              {joseiSubsidies.length === 0 ? (
                <div className="muted">
                  {selected}については、Web検索で確認できる利用料助成制度が見つかりませんでした。制度が無いという意味ではなく、見つからなかったということです。お住まいの市区町村教育委員会に直接お問い合わせください。
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                  {joseiSubsidies.map((s, i) => (
                    <div
                      key={`${s.entity}-${s.name}-${i}`}
                      style={{ borderBottom: '1px solid var(--border)', paddingBottom: 10 }}
                    >
                      <div className="qtext" style={{ fontWeight: 700 }}>{s.name}</div>
                      <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                        実施主体：{s.entity}{s.entityLevel === 'city' ? '（市区町村独自の制度）' : ''}
                      </div>
                      <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{s.summary}</div>
                      {s.note && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>※ {s.note}</div>}
                      <a
                        href={s.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="muted"
                        style={{ fontSize: 12, textDecoration: 'underline', display: 'inline-block', marginTop: 4 }}
                      >
                        出典を見る ›
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(type === 'gakko' || type === 'free' || type === 'shien' || type === 'tsushin' || type === 'josei') && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>{selected ? '都道府県を選び直す' : '都道府県から探す'}</div>
              {/* チップの壁をスクロールしなくても選べるよう、セレクトボックスも用意
                  （2026-10-18）。チップ自体はクローラーが各都道府県ページを個別に
                  たどれるリンクとして残している。 */}
              <PrefectureSelect selected={selected} type={type} />
              <div className="chip-row chip-row-wrap">
                {/* フリースクールタブでは、都道府県の一覧の中に「オンライン」も選択肢として
                    並べておく。地域で探している途中でそのまま切り替えられるように
                    （2026-10-18、都道府県チップの外に別タブとして置くより分かりやすいとの指摘）。 */}
                {type === 'free' && (
                  <Link
                    href="/gakko?type=online"
                    className="chip chip-tag"
                    style={{ textDecoration: 'none', display: 'inline-block', fontWeight: 700 }}
                  >
                    オンライン（全国どこからでも）
                  </Link>
                )}
                {PREFECTURES.map((p) => {
                  const count =
                    type === 'free'
                      ? freeSchoolCount(p)
                      : type === 'shien'
                        ? shienCount(p)
                        : type === 'tsushin'
                          ? tsushinCount(p)
                          : type === 'josei'
                            ? joseiCount(p)
                            : gakkoCount(p);
                  return (
                    <Link
                      key={p}
                      href={prefHref(p)}
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
          )}

          {type === 'gakko' && (
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
          )}

          {type === 'free' && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>このページのフリースクール情報について</div>
              <div className="qtext">
                フリースクールには文部科学省の全国統一リストがないため、このページのデータは都道府県・市区町村教育委員会等が個別に公開している一覧を集めたものです（{FREE_SCHOOL_COVERAGE.filter((c) => c.tier === 'good').length}都道府県で住所・連絡先つきの情報、{FREE_SCHOOL_COVERAGE.filter((c) => c.tier === 'partial').length}都道府県で一部情報、残りは公開リストなし）。最新情報は各施設・教育委員会に直接ご確認ください。
              </div>
            </div>
          )}

          {type === 'online' && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>このページのオンラインフリースクール情報について</div>
              <div className="qtext">
                教育委員会・都道府県・市区町村が公開している一覧（{ONLINE_FREE_SCHOOLS.filter((s) => s.sourceKind === 'government').length}件）と、運営会社・団体自身の公式サイト・発表（{ONLINE_FREE_SCHOOLS.filter((s) => s.sourceKind === 'official-site').length}件）をもとに掲載しています。教育委員会・学校等が認証・あっせんするものではなく、全国のサービスを網羅したものでもありません。利用前には各団体へ直接お問い合わせください。
              </div>
            </div>
          )}

          {type === 'shien' && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>このページの教育支援センター情報について</div>
              <div className="qtext">
                教育支援センターには文部科学省の全国統一リストがなく、全国の合計数のみが公表されています。このページのデータは、都道府県教育委員会が県内市区町村分をまとめて公開している一覧をもとにしています（{EDUCATION_SUPPORT_COVERAGE.filter((c) => c.tier === 'good').length}都道府県で名称・所在地つきの一覧、{EDUCATION_SUPPORT_COVERAGE.filter((c) => c.tier === 'partial').length}都道府県で一部情報、残りの都道府県は都道府県単位でまとめた一覧が見つかりませんでした）。一覧が見つからない都道府県でも、お住まいの市区町村には教育支援センターがある可能性が高いです。最新情報は各施設・教育委員会に直接ご確認ください。
              </div>
            </div>
          )}

          {type === 'tsushin' && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>このページの通信制高校情報について</div>
              <div className="qtext">
                文部科学省は通信制高校の学校名を含む全国一覧を公表していないため、このページのデータは東京都生活文化局が公開している「通信教育を行う区域に東京都を含む通信制高校の一覧」（{CORRESPONDENCE_HIGH_SCHOOLS.length}校、{CORRESPONDENCE_HIGH_SCHOOL_AS_OF}）をもとにしています。東京都を対象地域に含まない狭域の学校は含まれていないため、広域通信制高校のすべてを網羅したものではありません。学費・キャンパス所在地・カリキュラム等は各校の公式サイトで直接ご確認ください。
              </div>
            </div>
          )}

          {type === 'josei' && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>この助成金情報について</div>
              <div className="qtext">
                フリースクール等の利用料助成には文部科学省の全国統一リストがなく、実施する都道府県・市区町村も毎年変わる可能性があります。このページのデータは、2026年10月時点でWeb検索により確認できた、家庭（保護者）が直接利用料の助成を受けられる制度（{FREESCHOOL_SUBSIDIES.length}件）のみを掲載しており、フリースクール運営者向けの運営費補助等は含めていません。掲載の有無にかかわらず、最新の制度内容・対象条件・金額は必ずお住まいの自治体に直接ご確認ください。
              </div>
            </div>
          )}

          <Link href="/ask" className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>進路のことを相談してみませんか？</div>
            <div className="qtext">
              {type === 'free' ? 'フリースクール' : type === 'online' ? 'オンラインフリースクール' : type === 'shien' ? '教育支援センター' : type === 'tsushin' ? '通信制高校' : type === 'josei' ? '助成金・支援制度' : '学びの多様化学校'}が合うかどうかも含め、今のお子さんの状況からどうする先生が一緒に考えます。登録不要・匿名で利用できます。
            </div>
            <div className="muted" style={{ alignSelf: 'flex-end', fontWeight: 700, color: 'var(--orange-text)' }}>
              相談するページへ ›
            </div>
          </Link>

          {/* Xシェアボタン */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '12px 0 4px' }}>
            <div className="muted" style={{ fontSize: 12 }}>このページをシェアする</div>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('不登校のお子さんがいるご家庭へ。学びの多様化学校・フリースクール・教育支援センターなどを都道府県から探せます。助成金情報も。')}&url=${encodeURIComponent('https://futoko-dosuru.com/gakko')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#000',
                color: '#fff',
                borderRadius: 20,
                padding: '9px 18px',
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
              </svg>
              Xでシェアする
            </a>
          </div>
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
