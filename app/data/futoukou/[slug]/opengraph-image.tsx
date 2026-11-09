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
          fontFamily: fontData ? 'M PLUS Rounded 1c' : undefined,
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

        {/* グラフ本体（bars: 横棒／trend: 縦棒） */}
        <div style={{ display: 'flex', flex: 1, marginTop: 14, marginBottom: 8 }}>
          {items.length === 0 ? null : kind === 'trend' ? (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, width: '100%', paddingBottom: 6 }}>
              {items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 8 }}>
                  <div style={{ display: 'flex', fontSize: 18, fontWeight: 700, color: '#2B2B28' }}>
                    {formatChartValue(it.value, it.unit)}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      width: '62%',
                      height: `${Math.max(12, (it.value / maxValue) * 220)}px`,
                      background: idx === items.length - 1 ? '#3D7E65' : '#A9C9BD',
                      borderRadius: '6px 6px 0 0',
                    }}
                  />
                  <div style={{ display: 'flex', fontSize: 17, color: '#7A7566' }}>{it.label}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 12 }}>
              {items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
                  <div style={{ display: 'flex', width: 300, fontSize: 19, color: '#2B2B28', fontWeight: 700 }}>
                    {it.label.length > 16 ? `${it.label.slice(0, 16)}…` : it.label}
                  </div>
                  <div style={{ display: 'flex', flex: 1, height: 26, background: '#EDE8DA', borderRadius: 6 }}>
                    <div
                      style={{
                        display: 'flex',
                        width: `${Math.max(4, (it.value / maxValue) * 100)}%`,
                        height: '100%',
                        background: '#3D7E65',
                        borderRadius: 6,
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', width: 130, fontSize: 19, fontWeight: 700, color: '#3D7E65', justifyContent: 'flex-end' }}>
                    {formatChartValue(it.value, it.unit)}
                  </div>
                </div>
              ))}
            </div>
          )}
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
