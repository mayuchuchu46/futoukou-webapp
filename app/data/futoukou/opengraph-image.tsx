import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { FUTOUKOU_LATEST } from '@/lib/data/futoukouStats';

// 「データで見る不登校」ページ用の静的OGP画像（2026-11-08追加）。
// app/news/[id]/opengraph-image.tsxと同じ仕組み（next/og + Google Fontsのサブセット
// 取得）だが、このページは[id]のような動的パラメータを持たないため、数値は
// lib/data/futoukouStats.tsの定数から直接埋め込む。

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

export default async function Image() {
  const headlineValue = `${FUTOUKOU_LATEST.total.toLocaleString()}人`;
  const headlineLabel = `小・中学校の不登校児童生徒数（${FUTOUKOU_LATEST.label}）— 過去最多`;
  const subText = `新規不登校は9年ぶりに減少（${FUTOUKOU_LATEST.newTotal.toLocaleString()}人）`;

  const logoData = await readFile(join(process.cwd(), 'public/assets/sensei_logo.png'), 'base64');
  const logoSrc = `data:image/png;base64,${logoData}`;

  const fontData = await loadGoogleFont(
    `データで見る不登校どうする先生${headlineValue}${headlineLabel}${subText}`
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
          // fontFamily: undefined を明示的にstyleへ渡すと、next/og（@vercel/og）が
          // 内部でfontFamily.split(',')を呼んで例外になりフォント取得失敗時に画像生成
          // 自体が落ちる不具合があったため（2026-11-13、Xシェア時にOGP画像が出ない
          // 不具合の原因として判明）、未取得時はキー自体を付けないようにする。
          ...(fontData ? { fontFamily: 'M PLUS Rounded 1c' } : {}),
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
            データで見る不登校
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', fontSize: 120, fontWeight: 800, lineHeight: 1, color: '#3D7E65' }}>
              {headlineValue}
            </div>
            <div style={{ display: 'flex', fontSize: 38, fontWeight: 700, lineHeight: 1.3, color: '#2B2B28' }}>
              {headlineLabel}
            </div>
            <div style={{ display: 'flex', fontSize: 30, fontWeight: 700, lineHeight: 1.3, color: '#6FA389' }}>
              {subText}
            </div>
          </div>
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
