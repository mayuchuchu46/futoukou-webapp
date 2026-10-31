import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NEWS_ITEMS } from '@/lib/data/news';

// ニュース個別記事（/news/[id]）ごとの、インパクト数字を大きく載せたOGP画像を
// 動的生成する（2026-10-29追加。「わかりやすいインパクトある数字を見せつつ、
// バズりを意識した画像がいい」との要望を受けて）。仕組みはapp/gakko/school/[no]/
// opengraph-image.tsxと同じ（next/og + Google Fontsのサブセット取得）。
// headlineが無い記事（インパクト数字が確認できなかった記事）は、数字無しで
// タイトルだけの見た目にフォールバックする（無い数字をでっち上げない）。

const CATEGORY_LABEL: Record<string, string> = {
  policy: '制度・施策',
  research: '調査・統計',
  local: '自治体の取組',
  other: 'その他',
};

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

export const alt = 'どうする先生（不登校編）';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = NEWS_ITEMS.find((n) => n.id === id) || null;

  const categoryLabel = item ? CATEGORY_LABEL[item.category] || 'ニュース' : 'ニュース';
  const title = item?.title || '不登校に関する最新ニュース';
  const headlineValue = item?.headline?.value || '';
  const headlineLabel = item?.headline?.label || '';
  const stats = item?.stats || [];
  const maxStat = stats.length > 0 ? Math.max(...stats.map((s) => s.value)) : 0;

  const logoData = await readFile(join(process.cwd(), 'public/assets/sensei_logo.png'), 'base64');
  const logoSrc = `data:image/png;base64,${logoData}`;

  const statsText = stats.map((s) => `${s.label}${s.value}${s.unit}`).join('');
  // headline無しのフォールバックで出典名（item.sourceName）も画像内に表示するように
  // なったため（2026-10-30）、フォントのサブセット取得対象の文字列にも含める
  // （含めないと出典名の文字がフォント未読み込みのまま表示されてしまう）。
  const sourceName = item?.sourceName || '';
  const fontData = await loadGoogleFont(
    `どうする先生不登校編出典${categoryLabel}${title}${headlineValue}${headlineLabel}${statsText}${sourceName}`
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#FAF8F3',
          padding: '60px',
          fontFamily: fontData ? 'M PLUS Rounded 1c' : undefined,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              background: '#DDEEE8',
              color: '#3D7E65',
              fontSize: 28,
              fontWeight: 700,
              padding: '8px 26px',
              borderRadius: 999,
            }}
          >
            不登校ニュース・{categoryLabel}
          </div>

          {/* インパクト数字を主役にする（2026-10-29）。無い記事はこのブロック自体を
              出さず、タイトルだけを大きく見せる。statsがある記事は、数字の下に
              簡単な比較バーも添える（2026-10-29、「数字と合わせてグラフも
              入れたい」との要望を受けて追加）。
              一度statsCaption（説明文）をバーの上に足したが、「カードの文字が
              細かいのは伏せてグラフをもっと大きく見せたい」との指摘を受け、
              OGP画像側ではこの説明文は出さず（本文ページ側には残す）、代わりに
              バー自体を大きく・太くして視覚的なインパクトを優先する形に変更した。 */}
          {headlineValue ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: stats.length > 0 ? 20 : 10 }}>
              <div style={{ display: 'flex', fontSize: stats.length > 0 ? 100 : 148, fontWeight: 800, lineHeight: 1, color: '#3D7E65' }}>
                {headlineValue}
              </div>
              <div style={{ display: 'flex', fontSize: 40, fontWeight: 700, lineHeight: 1.3, color: '#2B2B28' }}>
                {headlineLabel}
              </div>

              {stats.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: 1080, marginTop: 10 }}>
                  {/* バー幅は「この記事内の最大値」ではなく、単位が%なら実際の
                      パーセント値（＝0〜100%の目盛り）をそのまま使う
                      （2026-10-29、「全体のうち何%かが伝わらない」との指摘を
                      受けて修正。components/NewsStatsChart.tsxと同じ考え方）。 */}
                  {stats.map((s) => {
                    const width = s.unit === '%'
                      ? Math.min(Math.max(s.value, s.value > 0 ? 2 : 0), 100)
                      : (maxStat > 0 ? Math.max((s.value / maxStat) * 100, 4) : 0);
                    return (
                      <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 28, fontWeight: 700, color: '#2B2B28' }}>
                          <span style={{ display: 'flex' }}>{s.label}</span>
                          <span style={{ display: 'flex', fontWeight: 800, color: s.value === maxStat ? '#3D7E65' : '#6FA389' }}>{s.value}{s.unit}</span>
                        </div>
                        <div style={{ display: 'flex', width: '100%', height: 38, background: '#E3DFD3', borderRadius: 19 }}>
                          <div
                            style={{
                              display: 'flex',
                              width: `${width}%`,
                              height: '100%',
                              background: s.value === maxStat ? '#3D7E65' : '#6FA389',
                              borderRadius: 19,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            // 見出し数字（headline）が無い記事のフォールバック（2026-10-30、
            // 「どの記事もインパクト重視の画像でシェアしたい」との要望を受けて強化）。
            // 以前はタイトルを大きく出すだけだったが、数字入りの記事と並ぶと見劣り
            // していたため、見出し数字の代わりに出典名を帯で見せ、タイトル下に
            // アクセントの太いバーを添えて、同じトーンの「主役がいる」構図にした
            // （無い数字を作る代わりに、記事の信頼性＝出典を主役にする考え方）。
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div
                style={{
                  display: 'flex',
                  fontSize: title.length > 28 ? 54 : 64,
                  fontWeight: 800,
                  lineHeight: 1.35,
                  color: '#2B2B28',
                }}
              >
                {title}
              </div>
              <div style={{ display: 'flex', width: 180, height: 10, background: '#3D7E65', borderRadius: 6 }} />
              {item?.sourceName && (
                <div style={{ display: 'flex', fontSize: 26, fontWeight: 700, color: '#6FA389' }}>
                  出典：{item.sourceName}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <img src={logoSrc} width={70} height={70} style={{ borderRadius: '50%' }} />
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 800, color: '#3D7E65' }}>どうする先生</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData ? [{ name: 'M PLUS Rounded 1c', data: fontData, style: 'normal', weight: 800 }] : undefined,
    }
  );
}
