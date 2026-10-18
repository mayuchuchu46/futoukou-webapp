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
export const metadata: Metadata = {
  title: `学びの多様化学校・フリースクールを都道府県から探す｜${SITE_NAME}`,
  description:
    '不登校の子どもに合わせた「学びの多様化学校」（旧：不登校特例校）や、民間の「フリースクール」を都道府県から探せます。文部科学省や教育委員会等の公開情報をもとに掲載しています。',
  alternates: { canonical: `${SITE_URL}/gakko` },
};

function gakkoCount(pref: string) {
  return MANABI_TAYOUKA_GAKKO.filter((s) => s.prefecture === pref).length;
}

function freeSchoolCount(pref: string) {
  return FREE_SCHOOLS.filter((s) => s.prefecture === pref).length;
}

export default async function GakkoPage({
  searchParams,
}: {
  searchParams: Promise<{ pref?: string; type?: string }>;
}) {
  const { pref, type: rawType } = await searchParams;
  const type: 'gakko' | 'free' = rawType === 'free' ? 'free' : 'gakko';
  const selected = pref && PREFECTURES.includes(pref) ? pref : null;
  const schools = selected ? MANABI_TAYOUKA_GAKKO.filter((s) => s.prefecture === selected) : [];
  const freeSchools = selected ? FREE_SCHOOLS.filter((s) => s.prefecture === selected) : [];
  const coverage = selected ? getFreeSchoolCoverage(selected) : undefined;
  const basePath = type === 'free' ? '/gakko?type=free' : '/gakko';
  const prefHref = (p: string) => (type === 'free' ? `/gakko?type=free&pref=${encodeURIComponent(p)}` : `/gakko?pref=${encodeURIComponent(p)}`);

  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <Link href="/" className="backlink" style={{ margin: '14px 0' }}>← もどる</Link>

          {/* 学校探しの入口を1ページに統合したので、冒頭で「学びの多様化学校」と
              「フリースクール」のどちらを探したいかをタブで切り替えられるようにした
              （2026-10-18）。都道府県の選択はタブを切り替えても保持する。 */}
          <div className="chip-row" style={{ margin: '0 0 4px' }}>
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
          </div>

          {type === 'gakko' ? (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>学びの多様化学校（旧：不登校特例校）とは</div>
              <div className="qtext">
                不登校の子どもの実態に配慮して、文部科学省から特別な教育課程を組むことを認められた学校・分校・分教室・コースです。通常の学校より授業時間を少なくしたり、体験活動を増やしたりと、学校ごとに柔軟な形で学べます。全国で{MANABI_TAYOUKA_GAKKO.length}校（本校・分校・分教室・コース指定を含む）が指定されています（{new Date().getFullYear()}年時点の文部科学省公表情報）。
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                入学には学区・転校手続き・面談など各校ごとの条件があります。気になる学校が見つかったら、まずは学校または教育委員会に直接お問い合わせください。
              </div>
            </div>
          ) : (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>フリースクールとは</div>
              <div className="qtext">
                学校以外の場所で過ごしたり学んだりできる民間の施設です。学びの多様化学校（MEXT指定校）と違い、フリースクールには全国を網羅した公的なリストが存在しません。このページでは、都道府県や市区町村の教育委員会等が公開している一覧をもとに、見つかった範囲で掲載しています。
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                都道府県によって、情報が充実している所もあれば、公開されたリストが見つからなかった所もあります。お住まいの地域が「見つかりませんでした」と表示される場合でも、フリースクール自体が無いとは限りません。お近くの教育委員会の相談窓口に直接お問い合わせいただくことをおすすめします。
              </div>
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

          {/* オンラインフリースクールは居住地を問わず利用できるため、都道府県の選択に
              関係なく常に案内する（2026-10-18追加）。特に地域のリストが見つからない
              都道府県を選んだ人にとっての代替選択肢になる。 */}
          {type === 'free' && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>オンラインフリースクール（全国どこからでも利用可）</div>
              <div className="muted" style={{ fontSize: 12 }}>
                お住まいの地域にフリースクールが見つからない場合でも、オンラインで利用できる選択肢があります。件数が多いため、性質ごとに分けて掲載しています。
              </div>
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
              <div className="muted" style={{ fontSize: 12 }}>
                ※ このうち{ONLINE_FREE_SCHOOLS.filter((s) => s.sourceKind === 'government').length}件は教育委員会・市区町村が公開している情報をもとに、残り{ONLINE_FREE_SCHOOLS.filter((s) => s.sourceKind === 'official-site').length}件は運営会社の公式サイト・発表に基づき掲載しています。教育委員会・学校等が認証・あっせんするものではなく、利用前には各団体へ直接お問い合わせください。
              </div>
            </div>
          )}

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>{selected ? '都道府県を選び直す' : '都道府県から探す'}</div>
            {/* チップの壁をスクロールしなくても選べるよう、セレクトボックスも用意
                （2026-10-18）。チップ自体はクローラーが各都道府県ページを個別に
                たどれるリンクとして残している。 */}
            <PrefectureSelect selected={selected} type={type} />
            <div className="chip-row chip-row-wrap">
              {PREFECTURES.map((p) => {
                const count = type === 'free' ? freeSchoolCount(p) : gakkoCount(p);
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

          {type === 'gakko' ? (
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
          ) : (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>このページのフリースクール情報について</div>
              <div className="qtext">
                フリースクールには文部科学省の全国統一リストがないため、このページのデータは都道府県・市区町村教育委員会等が個別に公開している一覧を集めたものです（{FREE_SCHOOL_COVERAGE.filter((c) => c.tier === 'good').length}都道府県で住所・連絡先つきの情報、{FREE_SCHOOL_COVERAGE.filter((c) => c.tier === 'partial').length}都道府県で一部情報、残りは公開リストなし）。最新情報は各施設・教育委員会に直接ご確認ください。
              </div>
            </div>
          )}

          <Link href="/ask" className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>進路のことを相談してみませんか？</div>
            <div className="qtext">
              {type === 'free' ? 'フリースクール' : '学びの多様化学校'}が合うかどうかも含め、今のお子さんの状況からどうする先生が一緒に考えます。登録不要・匿名で利用できます。
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
