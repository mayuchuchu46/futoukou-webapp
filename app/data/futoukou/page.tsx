import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import NewsStatsChart from '@/components/NewsStatsChart';
import YearTrendChart from '@/components/YearTrendChart';
import FutoukouSummaryGrid from '@/components/FutoukouSummaryGrid';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import {
  FUTOUKOU_YEARLY_TREND,
  FUTOUKOU_LATEST,
  FUTOUKOU_BY_GRADE,
  FUTOUKOU_BY_PREFECTURE,
  FUTOUKOU_NATIONAL_AVG_PER_1000,
  FUTOUKOU_FACTORS,
  FUTOUKOU_HIGH_SCHOOL_TREND,
  FUTOUKOU_CONTINUATION_RATE,
  FUTOUKOU_SOURCE,
} from '@/lib/data/futoukouStats';

// 「データで見る不登校」ページ（2026-11-08新設）。
//
// 【目的】（claude/futoukou-data-page-concept.mdに企画の記録あり）
// 1. 文部科学省の公的統計を可視化した客観コンテンツとして、シェア・被リンクを
//    獲得しやすい「リンクされる資産」を作る。
// 2. 最大の競合と判定したTOKYO多様な学びの場・居場所ナビ（東京都公式、対象は
//    都内＋隣接4県限定）に対し、「全国データ」という網羅性で差別化する。
//
// 【データの正確性について】掲載する数値はすべて文部科学省「令和6年度 児童生徒の
// 問題行動・不登校等生徒指導上の諸課題に関する調査結果」（公表：令和7年10月29日）
// から確認したもの（lib/data/futoukouStats.ts参照）。推測の数値は載せない。
//
// 【構成（2026-11-08見直し）】「1ページに羅列だけどもっと整理したUIにして」との
// 指摘を受けて、以下の2段構成にした：
// 1. 冒頭のFutoukouSummaryGrid（全データの数字タイル一覧、タップで個別シェア
//    ページ/data/futoukou/[slug]に飛べる）で、まず全体を見渡せるようにする。
// 2. その下に、詳細セクションを「①数の変化」「②誰が・どこで」「③なぜ・そして
//    どうする」の3グループに分けて並べる（.futoukou-section-heading見出し）。
//    以前は8セクションを単純に縦へ並べているだけだった。
export const metadata: Metadata = {
  title: `データで見る不登校｜不登校児童生徒数は過去最多353,970人 - ${SITE_NAME}`,
  description:
    '文部科学省の最新調査（令和6年度）から、不登校児童生徒数の推移・学年別・都道府県別・要因別のデータをまとめました。小中学生の不登校は過去最多の353,970人。一方で新規の不登校は9年ぶりに減少しています。',
  alternates: { canonical: `${SITE_URL}/data/futoukou` },
  openGraph: {
    title: '不登校児童生徒数は過去最多353,970人｜データで見る不登校',
    description: '文部科学省の最新調査から、不登校の推移・学年別・都道府県別・要因別のデータをまとめました。',
    url: `${SITE_URL}/data/futoukou`,
    siteName: SITE_NAME,
    type: 'article',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: '不登校児童生徒数は過去最多353,970人｜データで見る不登校',
    description: '文部科学省の最新調査から、不登校の推移・学年別・都道府県別・要因別のデータをまとめました。',
  },
};

export default function FutoukouDataPage() {
  const trendData = FUTOUKOU_YEARLY_TREND.map((d) => ({ label: d.year, value: d.total }));
  const gradeStats = FUTOUKOU_BY_GRADE.map((g) => ({ label: g.grade, value: g.r6, unit: '人' }));
  const factorStats = FUTOUKOU_FACTORS.map((f) => ({ label: f.label, value: f.total, unit: '件' }));
  const prefRanked = [...FUTOUKOU_BY_PREFECTURE].sort((a, b) => b.per1000 - a.per1000);
  const highSchoolTrendData = FUTOUKOU_HIGH_SCHOOL_TREND.map((d) => ({ label: d.year, value: d.value }));
  const continuationLatest = FUTOUKOU_CONTINUATION_RATE[FUTOUKOU_CONTINUATION_RATE.length - 1];
  const continuationPrev = FUTOUKOU_CONTINUATION_RATE[FUTOUKOU_CONTINUATION_RATE.length - 2];

  const url = `${SITE_URL}/data/futoukou`;

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <h1 className="pagetitle">データで見る不登校</h1>
          <div className="muted" style={{ marginBottom: 4 }}>
            文部科学省「{FUTOUKOU_LATEST.label} 児童生徒の問題行動・不登校等生徒指導上の諸課題に関する調査結果」（公表：{FUTOUKOU_SOURCE.publishedAt}）をもとに、不登校に関する統計データをまとめました。気になるものをタップすると、その数字だけのシェア用ページに飛べます。
          </div>

          <FutoukouSummaryGrid />

          {/* 一番伝えたい数字を主役にする（app/news/[id]/page.tsxのheadlineカードと
              同じ考え方）。 */}
          <div className="card" style={{ alignItems: 'flex-start', gap: 6, background: 'var(--main)', border: 'none' }}>
            <div style={{ fontSize: 44, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
              {FUTOUKOU_LATEST.total.toLocaleString()}人
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>
              小・中学校の不登校児童生徒数（{FUTOUKOU_LATEST.label}）— 過去最多、12年連続で増加
            </div>
          </div>

          {/* ① 数の変化：経年推移／新規減少／継続率 */}
          <div className="futoukou-section-heading">① 数はどう変わった？</div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>不登校児童生徒数の推移（小・中学校合計）</div>
            <YearTrendChart data={trendData} unit="人" />
            <div className="qtext" style={{ fontSize: 13 }}>
              平成26年度の122,897人から、{FUTOUKOU_LATEST.label}には{FUTOUKOU_LATEST.total.toLocaleString()}人へ。12年連続で増加していますが、増加率そのものは{FUTOUKOU_LATEST.prevIncreaseRateTotal}%（前年度）から{FUTOUKOU_LATEST.increaseRateTotal}%（{FUTOUKOU_LATEST.label}）に低下しています。
            </div>
            <Link href="/data/futoukou/total" style={{ fontSize: 13, fontWeight: 700, color: 'var(--main)' }}>
              このグラフだけをシェアする →
            </Link>
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>「増え続けている」わけではない数字も</div>
            <div className="qtext">
              新たに不登校になった児童生徒数（新規不登校児童生徒数）は、小・中学校合計で{FUTOUKOU_LATEST.newTotal.toLocaleString()}人（前年度{FUTOUKOU_LATEST.prevNewTotal.toLocaleString()}人）と、<b>9年ぶりに減少</b>しました。不登校児童生徒数全体が過去最多になっている一方で、新しく不登校になる子どもの数自体は減っています。
            </div>
            <NewsStatsChart
              stats={[
                { label: '新規（前年度）', value: FUTOUKOU_LATEST.prevNewTotal, unit: '人' },
                { label: `新規（${FUTOUKOU_LATEST.label}）`, value: FUTOUKOU_LATEST.newTotal, unit: '人' },
              ]}
            />
            <Link href="/data/futoukou/shinki" style={{ fontSize: 13, fontWeight: 700, color: 'var(--main)' }}>
              このデータだけをシェアする →
            </Link>
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>不登校が「続く」割合（継続率）も下がった</div>
            <div className="qtext" style={{ fontSize: 13 }}>
              前回調査で不登校だった児童生徒のうち、今回調査でも不登校だった割合（継続率）は、小学校{continuationLatest.elementary}%（前年度{continuationPrev.elementary}%）、中学校{continuationLatest.juniorHigh}%（前年度{continuationPrev.juniorHigh}%）で、どちらも前年度より低下しました。新規の減少だけでなく、継続率自体も下がっています。
            </div>
            <NewsStatsChart
              stats={[
                { label: '小学校（前年度）', value: continuationPrev.elementary, unit: '%' },
                { label: '小学校（今年度）', value: continuationLatest.elementary, unit: '%' },
                { label: '中学校（前年度）', value: continuationPrev.juniorHigh, unit: '%' },
                { label: '中学校（今年度）', value: continuationLatest.juniorHigh, unit: '%' },
              ]}
            />
            <Link href="/data/futoukou/keizoku" style={{ fontSize: 13, fontWeight: 700, color: 'var(--main)' }}>
              このデータだけをシェアする →
            </Link>
          </div>

          {/* ② 誰が・どこで：学年別／都道府県別／高校 */}
          <div className="futoukou-section-heading">② 誰が・どこで多い？</div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>学年別の不登校児童生徒数（{FUTOUKOU_LATEST.label}）</div>
            <NewsStatsChart stats={gradeStats} caption="学年が上がるほど多くなる傾向。小6→中1で大きく増えています。" />
            <Link href="/data/futoukou/gakunen" style={{ fontSize: 13, fontWeight: 700, color: 'var(--main)' }}>
              このグラフだけをシェアする →
            </Link>
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>都道府県別 1,000人当たりの不登校児童生徒数</div>
            <div className="qtext" style={{ fontSize: 13 }}>
              全国平均は{FUTOUKOU_NATIONAL_AVG_PER_1000}人／1,000人です。多い順にランキングしました。
            </div>
            <div className="ranking" style={{ width: '100%' }}>
              {prefRanked.map((p, i) => (
                <div key={p.prefecture} className="rank-item">
                  <span className="rank-num">{i + 1}</span>
                  <span className="rank-q" style={{ display: 'block', WebkitLineClamp: 'unset' }}>{p.prefecture}</span>
                  <span className="muted" style={{ fontSize: 12, fontWeight: 700, color: 'var(--main)' }}>{p.per1000}人</span>
                </div>
              ))}
            </div>
            <Link href="/data/futoukou/todouhuken" style={{ fontSize: 13, fontWeight: 700, color: 'var(--main)' }}>
              このランキングだけをシェアする →
            </Link>
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>高等学校の不登校生徒数の推移</div>
            <YearTrendChart data={highSchoolTrendData} unit="人" />
            <div className="qtext" style={{ fontSize: 13 }}>
              小・中学校と違い、高校生の不登校生徒数は増減を繰り返しています。令和2年度に43,051人まで減った後、令和5年度には68,770人まで急増し、{FUTOUKOU_LATEST.label}はわずかに減って{FUTOUKOU_HIGH_SCHOOL_TREND[FUTOUKOU_HIGH_SCHOOL_TREND.length - 1].value.toLocaleString()}人でした。
            </div>
            <Link href="/data/futoukou/koukou" style={{ fontSize: 13, fontWeight: 700, color: 'var(--main)' }}>
              このグラフだけをシェアする →
            </Link>
          </div>

          {/* ③ なぜ・そしてどうする：要因別／出席扱い制度 */}
          <div className="futoukou-section-heading">③ なぜ・そしてどうする？</div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>不登校について学校が把握した事実（{FUTOUKOU_LATEST.label}、小・中学校合計）</div>
            <div className="qtext" style={{ fontSize: 13 }}>
              最も多いのは「学校生活に対してやる気が出ない等」（{FUTOUKOU_FACTORS[0].total.toLocaleString()}件）。「いじめ被害の情報や相談」は{FUTOUKOU_FACTORS[FUTOUKOU_FACTORS.length - 1].total.toLocaleString()}件で最も少なく、不登校の要因は一般的なイメージより幅広いことがわかります（1人に複数の項目が該当する場合があるため、合計は不登校児童生徒数とは一致しません）。
            </div>
            <NewsStatsChart stats={factorStats} />
            <Link href="/data/futoukou/youin" style={{ fontSize: 13, fontWeight: 700, color: 'var(--main)' }}>
              このグラフだけをシェアする →
            </Link>
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>学校以外の学びも「出席」として認められる制度</div>
            <div className="qtext" style={{ fontSize: 13 }}>
              学校外の機関等で相談・指導を受け、指導要録上「出席扱い」となった児童生徒は{FUTOUKOU_LATEST.attendanceCountedOutsideSchool.toLocaleString()}人（前年度{FUTOUKOU_LATEST.prevAttendanceCountedOutsideSchool.toLocaleString()}人）、自宅でのICT等を活用した学習を出席扱いとされた児童生徒は{FUTOUKOU_LATEST.attendanceCountedIctHome.toLocaleString()}人（前年度{FUTOUKOU_LATEST.prevAttendanceCountedIctHome.toLocaleString()}人）で、どちらも前年度より増えています。
            </div>
            <Link href="/data/futoukou/shusseki" style={{ fontSize: 13, fontWeight: 700, color: 'var(--main)' }}>
              このデータだけをシェアする →
            </Link>
          </div>

          {/* ページ全体（まとめ）をシェアするボタン（app/news/[id]/page.tsxと同じ仕組み）。
              各セクション内の「このグラフだけをシェアする →」は、1つの数字・グラフだけを
              主役にした個別ページ（/data/futoukou/[slug]）へのリンク（2026-11-08追加、
              「それぞれのページを作ってシェアするときは一つのグラフや数字のインパクトで
              拡散を狙いたい」との要望を受けて）。こちらはまとめ全体をシェアしたい場合用。 */}
          <a
            className="share-btn"
            style={{ width: '100%' }}
            href={`https://twitter.com/intent/tweet?${new URLSearchParams({
              text: `不登校児童生徒数は過去最多の${FUTOUKOU_LATEST.total.toLocaleString()}人。でも新規不登校は9年ぶりに減少——文部科学省の最新データをまとめました。`,
              url,
              hashtags: '不登校,どうする先生',
            })}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="share-btn-icon">𝕏</span>
            まとめ全体をシェア
          </a>

          {/* 相談・学校検索への誘導 */}
          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>
              データだけでなく、うちの子の場合はどうなんだろう……と思ったら
            </div>
            <div className="qtext">登録不要・匿名で、AIと専門家・経験者に相談できます。</div>
            <Link href="/ask" className="btn-primary sidebar-ask-btn-pink" style={{ textDecoration: 'none', width: '100%' }}>
              相談してみる →
            </Link>
            <Link href="/gakko/shindan" className="btn-secondary" style={{ textDecoration: 'none', width: '100%', textAlign: 'center' }}>
              学校・学びの場を条件から探す →
            </Link>
          </div>

          <a href={FUTOUKOU_SOURCE.url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ fontSize: 13 }}>
            出典：{FUTOUKOU_SOURCE.name}（{FUTOUKOU_SOURCE.publishedAt}） ›
          </a>

          <Link href="/" className="backlink">← ホームに戻る</Link>
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
