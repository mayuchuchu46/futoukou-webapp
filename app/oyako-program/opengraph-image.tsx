import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// 「子どもとの関わり方3ヶ月実践プログラム」LP専用のOGP画像（2026-11-28追加）。
// これを追加するまでは openGraph.images を指定していなかったため、サイト共通の
// デフォルトOGP画像（どうする先生ロゴのみ）がシェア時に表示されていた。
// app/data/futoukou/opengraph-image.tsxと同じ仕組み（next/og + Google Fontsの
// サブセット取得）。配色はapp/oyako-program/page.tsxのPAGE_STYLE内の
// CSS変数（--cream, --coral, --sage等）に合わせている。

async function loadGoogleFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const familyParam = encodeURIComponent('M PLUS Rounded 1c');
    const cssUrl = `https://fonts.googleapis.com/css2?family=${familyParam}:wght@700;800&text=${encodeURIComponent(text)}`;
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

export const alt = '公認心理師が伴走する、子どもとの関わり方3ヶ月実践プログラム｜どうする先生';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const kicker = '公認心理師が伴走する';
  const titleLine1 = '子どもとの関わり方';
  const titleLine2 = '3ヶ月実践プログラム';
  const subText = '不登校・行き渋り・発達特性に迷う保護者へ｜全6回のワークショップ＋個別カウンセリング＋コミュニティ';
  const badgeText = '早期割引キャンペーン実施中';

  const logoData = await readFile(join(process.cwd(), 'public/assets/sensei_logo.png'), 'base64');
  const logoSrc = `data:image/png;base64,${logoData}`;

  const fontData = await loadGoogleFont(`${kicker}${titleLine1}${titleLine2}${subText}${badgeText}どうする先生`);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#F7FAFA',
          padding: '64px',
          // fontFamily: undefined を明示的にstyleへ渡すと、next/og（@vercel/og）が
          // 内部でfontFamily.split(',')を呼んで例外になりフォント取得失敗時に画像生成
          // 自体が落ちる不具合があったため、未取得時はキー自体を付けないようにする。
          ...(fontData ? { fontFamily: 'M PLUS Rounded 1c' } : {}),
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              background: '#FFF6CC',
              color: '#C9A227',
              fontSize: 24,
              fontWeight: 700,
              padding: '8px 24px',
              borderRadius: 999,
            }}
          >
            {badgeText}
          </div>

          <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, color: '#00838F' }}>{kicker}</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', fontSize: 72, fontWeight: 800, lineHeight: 1.15, color: '#333638' }}>
              {titleLine1}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 72,
                fontWeight: 800,
                lineHeight: 1.15,
                color: '#00A9B8',
              }}
            >
              {titleLine2}
            </div>
          </div>

          <div style={{ display: 'flex', fontSize: 26, fontWeight: 700, lineHeight: 1.5, color: '#4D5355', maxWidth: 980 }}>
            {subText}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <img src={logoSrc} width={64} height={64} style={{ borderRadius: '50%' }} />
          <div style={{ display: 'flex', fontSize: 30, fontWeight: 800, color: '#333638' }}>どうする先生 × てつなぎ</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData ? [{ name: 'M PLUS Rounded 1c', data: fontData, style: 'normal', weight: 800 }] : undefined,
    }
  );
}
