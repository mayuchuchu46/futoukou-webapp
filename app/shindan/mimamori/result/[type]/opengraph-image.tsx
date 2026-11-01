import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { MIMAMORI_RESULTS, type MimamoriType } from '@/lib/mimamoriShindan';

// 診断結果（タイプ）ごとのOGP画像（2026-11-01追加）。/result/[id]/opengraph-image.tsx・
// /gakko/school/[no]/opengraph-image.tsxと同じ仕組み（next/og + Google Fontsの
// サブセット取得）を踏襲している。タイプは4種類のみ・内容も固定のため、
// generateStaticParamsで全件ビルド時にプリレンダーする（アクセスごとの
// サーバー処理は発生しない）。
const TYPES = Object.keys(MIMAMORI_RESULTS) as MimamoriType[];

export function generateStaticParams() {
  return TYPES.map((type) => ({ type }));
}

async function loadGoogleFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const familyParam = encodeURIComponent('M PLUS Rounded 1c');
    const cssUrl = `https://fonts.googleapis.com/css2?family=${familyParam}:wght@800&text=${encodeURIComponent(text)}`;
    const cssRes = await fetch(cssUrl, {
      headers: {
        // woff2非対応の古いUAを装うことで、Satoriが読めるttf/otf形式のURLを引き出す。
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

export const alt = '見守り力タイプ診断（どうする先生）';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const result = MIMAMORI_RESULTS[type as MimamoriType] ?? null;

  const logoData = await readFile(join(process.cwd(), 'public/assets/sensei_logo.png'), 'base64');
  const logoSrc = `data:image/png;base64,${logoData}`;

  const name = result?.name || '見守り力タイプ診断';
  const catchText = result?.catch || '';

  // フォントは実際に描画する文字だけに絞って取得する（ブランド名・バッジ・タイプ名・キャッチコピー）。
  const fontData = await loadGoogleFont(`どうする先生不登校編見守り力タイプ診断${name}${catchText}`);

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
          padding: '64px',
          fontFamily: fontData ? 'M PLUS Rounded 1c' : undefined,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              background: '#DDEEE8',
              color: '#3D7E65',
              fontSize: 30,
              fontWeight: 700,
              padding: '10px 28px',
              borderRadius: 999,
            }}
          >
            見守り力タイプ診断
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.3,
              color: '#2B2B28',
            }}
          >
            {name}
          </div>
          {catchText && (
            <div style={{ display: 'flex', fontSize: 38, fontWeight: 600, lineHeight: 1.5, color: '#6B6B63' }}>
              {catchText}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <img src={logoSrc} width={76} height={76} style={{ borderRadius: '50%' }} />
          <div style={{ display: 'flex', fontSize: 36, fontWeight: 800, color: '#3D7E65' }}>どうする先生</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData ? [{ name: 'M PLUS Rounded 1c', data: fontData, style: 'normal', weight: 800 }] : undefined,
    }
  );
}
