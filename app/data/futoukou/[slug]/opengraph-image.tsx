import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getFutoukouDataCard, type FutoukouDataCard } from '@/lib/data/futoukouDataCards';

// データカード個別ページ（/data/futoukou/[slug]）ごとの動的OGP画像。
// app/news/[id]/opengraph-image.tsxと同じ仕組み（next/og + Google Fontsのサブセット
// 取得）。
//
// 2026-11-10改修：当初は「1つの数字だけを主役にする」方針で、見出し数字とラベルだけの
// シンプルな画像にしていたが、実際にXでシェアしてみたところ「グラフとかの画像のほうが
// よかった」とのフィードバックを受けた。数字だけでは「632億円のはずが95億円」のような
// "比較"のインパクトが伝わらないため、カードのchartデータ（bars/trend/ranking）を
// 画像内に簡易グラフとして描画するように変更。見出し数字はやや小さくして上部に残し、
// その下にグラフを置く2段構成にした。
// 2026-11-19改修：「療育のミカタ」さん（@ryoiku_mikata）のX投稿にあった、項目と数値を
// 並べた表組み画像（ヘッダー行＋縞模様の行、インパクトのある数値を強調表示）のイメージが
// 良いとのフィードバックを受け、棒グラフ／縦棒グラフ描画をやめて、全カード共通で
// 「ヘッダー行＋データ行」の表組みレイアウトに変更した。
// ランキング・要因別など項目数が多いchartは、画像内では見やすさを優先して上位6件までに
// 絞って表示する（全件は本文ページ側で見てもらう設計）。

async function loadGoogleFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const familyParam = encodeURIComponent('M PLUS Rounded 1c');
    const cssUrl = `https://fonts.googleapis.com/css2?family=${familyParam}:wght@800&text=${encodeURIComponent(text)}`;
    const cssRes = await fetch(cssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko',
      },
    });
    const css = await cssRes.text();
    const match = css.match(/src: url\(([^)]+)\)/);
    if (!match) return null;
    const fontRes = await fetch(match[1]);
    if (fontRes.status !== 200) return null;
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

export const alt = 'データで見る不登校｜どうする先生';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type ChartItem = { label: string; value: number; unit: string };

// カードのchartを、画像内で描ける形（label/value/unitの配列）に正規化する。
// 件数が多いものは上位6件に絞る（trendは直近6年分を使う）。
function normalizeChartItems(chart: FutoukouDataCard['chart']): { items: ChartItem[]; kind: 'bars' | 'trend' } {
  if (chart.type === 'trend') {
    const data = chart.data.slice(-6);
    return { items: data.map((d) => ({ label: d.label, value: d.value, unit: chart.unit })), kind: 'trend' };
  }
  if (chart.type === 'bars') {
    return { items: chart.stats.slice(0, 6), kind: 'bars' };
  }
  // ranking: 既に多い順にソートされている前提で上位6件のみ
  return { items: chart.items.slice(0, 6).map((i) => ({ label: i.label, value: i.value, unit: i.unit })), kind: 'bars' };
}

function formatChartValue(v: number, unit: string): string {
  return `${v.toLocaleString()}${unit}`;
}

// 表の右列ヘッダーに出す見出し（データの単位から判断）。
function unitColumnHeader(unit: string | undefined): string {
  switch (unit) {
    case '人':
      return '人数';
    case '%':
      return '割合';
    case '億円':
      return '金額';
    case '件':
      return '件数';
    case '校':
      return '校数';
    default:
      return unit || '数値';
  }
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = getFutoukouDataCard(slug);

  const headlineValue = card?.headlineValue || 'データで見る不登校';
  const headlineLabel = card?.headlineLabel || '';

  const logoData = await readFile(join(process.cwd(), 'public/assets/sensei_logo.png'), 'base64');
  const logoSrc = `data:image/png;base64,${logoData}`;

  const { items, kind } = card ? normalizeChartItems(card.chart) : { items: [], kind: 'bars' as const };
  const maxValue = items.length ? Math.max(...items.map((i) => i.value)) : 1;

  const fontText = `データで見る不登校どうする先生${headlineValue}${headlineLabel}${items
    .map((i) => `${i.label}${formatChartValue(i.value, i.unit)}`)
    .join('')}`;
  const fontData = await loadGoogleFont(fontText);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#FAF8F3',
          padding: '48px 60px 36px',
          // fontFamily: undefined を明示的にstyleへ渡すと、next/og（@vercel/og）が
          // 内部でfontFamily.split(',')を呼んで例外になりフォント取得失敗時に画像生成
          // 自体が落ちる不具合があったため（2026-11-13、Xシェア時にOGP画像が出ない
          // 不具合の原因として判明）、未取得時はキー自体を付けないようにする。
          ...(fontData ? { fontFamily: 'M PLUS Rounded 1c' } : {}),
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              background: '#DDEEE8',
              color: '#3D7E65',
              fontSize: 24,
              fontWeight: 700,
              padding: '6px 22px',
              borderRadius: 999,
            }}
          >
            データで見る不登校
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
            <div style={{ display: 'flex', fontSize: 84, fontWeight: 800, lineHeight: 1, color: '#3D7E65' }}>
              {headlineValue}
            </div>
          </div>
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, lineHeight: 1.35, color: '#2B2B28', maxWidth: 1080 }}>
            {headlineLabel}
          </div>
        </div>

        {/* 表組み本体（項目名＋数値の2列テーブル。ヘッダー行＋縞模様の行、
            インパクトのある数値の行だけ強調表示する） */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            marginTop: 14,
            marginBottom: 8,
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid #EDE8DA',
          }}
        >
          {items.length > 0 && (
            <div style={{ display: 'flex', background: '#DDEEE8' }}>
              <div style={{ display: 'flex', flex: 1, alignItems: 'center', padding: '0 26px', fontSize: 20, fontWeight: 700, color: '#3D7E65' }}>
                {kind === 'trend' ? '年度' : '項目'}
              </div>
              <div
                style={{
                  display: 'flex',
                  width: 220,
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  padding: '0 26px',
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#3D7E65',
                }}
              >
                {unitColumnHeader(items[0]?.unit)}
              </div>
            </div>
          )}
          {items.map((it, idx) => {
            // trend（経年推移）は直近の年度、bars/ranking（項目比較）は最大値の行を
            // インパクトのある数値として強調する。
            const isHighlight = kind === 'trend' ? idx === items.length - 1 : it.value === maxValue;
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flex: 1,
                  alignItems: 'center',
                  background: isHighlight ? '#FBF0E4' : idx % 2 === 0 ? '#FFFFFF' : '#FAF8F3',
                  borderTop: '1px solid #EDE8DA',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flex: 1,
                    padding: '0 26px',
                    fontSize: 19,
                    fontWeight: isHighlight ? 700 : 500,
                    color: '#2B2B28',
                  }}
                >
                  {it.label.length > 20 ? `${it.label.slice(0, 20)}…` : it.label}
                </div>
                <div
                  style={{
                    display: 'flex',
                    width: 220,
                    justifyContent: 'flex-end',
                    padding: '0 26px',
                    fontSize: 23,
                    fontWeight: 800,
                    color: isHighlight ? '#C2622B' : '#3D7E65',
                  }}
                >
                  {formatChartValue(it.value, it.unit)}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src={logoSrc} width={56} height={56} style={{ borderRadius: '50%' }} />
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 800, color: '#3D7E65' }}>どうする先生</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData ? [{ name: 'M PLUS Rounded 1c', data: fontData, style: 'normal', weight: 800 }] : undefined,
    }
  );
}
