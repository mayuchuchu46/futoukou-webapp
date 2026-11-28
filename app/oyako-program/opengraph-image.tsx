import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// 「子どもとの関わり方3ヶ月実践プログラム」LP専用のOGP画像（2026-11-28追加）。
// 当初はapp/data/futoukou/opengraph-image.tsxと同じ「バッジ＋見出し＋ロゴ」の
// カード型デザインだったが、「LPのトップ（ヒーロー）をそのままスクショしたような
// 画面にしたい」というフィードバックを受け、ヒーローセクション（親子の写真＋
// グラデーション＋見出し）をほぼそのまま再現する形に変更（2026-11-28）。
// app/data/futoukou/opengraph-image.tsxと同じ仕組み（next/og + Google Fontsの
// サブセット取得）。配色・構図はapp/oyako-program/page.tsxのヒーローセクション
// （PAGE_BODY内の<!-- HERO -->）に合わせている。

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
  const pillText1 = '全6回・3ヶ月コース';
  const pillText2 = '個別カウンセリング付';
  const kicker = '公認心理師が伴走する';
  const titleLine1 = '子どもとの関わり方';
  const titleLine2 = '3ヶ月実践プログラム';
  const badgeText = '早期割引実施中';

  const [photoData, logoData] = await Promise.all([
    readFile(join(process.cwd(), 'public/images/oyako-program/d958e240cd492914484b48b7ffef597d.png'), 'base64'),
    readFile(join(process.cwd(), 'public/assets/sensei_logo.png'), 'base64'),
  ]);
  const photoSrc = `data:image/png;base64,${photoData}`;
  const logoSrc = `data:image/png;base64,${logoData}`;

  const fontData = await loadGoogleFont(
    `${pillText1}${pillText2}${kicker}${titleLine1}${titleLine2}${badgeText}どうする先生×てつなぎ｜`
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: '#F7FAFA',
          ...(fontData ? { fontFamily: 'M PLUS Rounded 1c' } : {}),
        }}
      >
        <img
          src={photoSrc}
          width={1200}
          height={630}
          style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630, objectFit: 'cover', objectPosition: '75% 30%' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            backgroundImage:
              'linear-gradient(100deg, #F7FAFA 0%, #F7FAFA 40%, rgba(247,250,250,0.92) 52%, rgba(247,250,250,0.5) 64%, rgba(247,250,250,0.1) 78%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            backgroundImage: 'linear-gradient(0deg, #E6F4F3 0%, rgba(230,244,243,0) 22%)',
          }}
        />

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 20,
            padding: '0 0 0 68px',
            width: 700,
            height: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              background: '#FFF6CC',
              color: '#C9A227',
              fontSize: 22,
              fontWeight: 700,
              padding: '7px 22px',
              borderRadius: 999,
            }}
          >
            {badgeText}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                background: '#DFF3F4',
                color: '#00838F',
                fontSize: 18,
                fontWeight: 700,
                padding: '6px 16px',
                borderRadius: 999,
              }}
            >
              {pillText1}
            </div>
            <div
              style={{
                display: 'flex',
                background: '#DFF3F4',
                color: '#00838F',
                fontSize: 18,
                fontWeight: 700,
                padding: '6px 16px',
                borderRadius: 999,
              }}
            >
              {pillText2}
            </div>
          </div>

          <div style={{ display: 'flex', fontSize: 24, fontWeight: 700, color: '#00838F' }}>{kicker}</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', fontSize: 64, fontWeight: 800, lineHeight: 1.2, color: '#333638' }}>
              {titleLine1}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 64,
                fontWeight: 800,
                lineHeight: 1.2,
                color: '#00A9B8',
                borderBottom: '6px solid #FFD900',
                paddingBottom: 4,
              }}
            >
              {titleLine2}
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 68, bottom: 36, display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src={logoSrc} width={44} height={44} style={{ borderRadius: '50%' }} />
          <div style={{ display: 'flex', fontSize: 22, fontWeight: 800, color: '#333638' }}>どうする先生 × てつなぎ</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData ? [{ name: 'M PLUS Rounded 1c', data: fontData, style: 'normal', weight: 800 }] : undefined,
    }
  );
}
