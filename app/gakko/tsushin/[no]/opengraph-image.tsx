import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { CORRESPONDENCE_HIGH_SCHOOLS } from '@/lib/data/correspondenceHighSchools';

// 通信制高校紹介ページ（/gakko/tsushin/[no]）ごとに、学校名を載せたOGP画像を動的生成する
// （2026-10-21、フリースクール版（app/gakko/free/[no]/opengraph-image.tsx）と合わせて
// 同時に追加。学びの多様化学校のopengraph-image.tsxと同じ仕組み・考え方を踏襲）。
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

export default async function Image({ params }: { params: Promise<{ no: string }> }) {
  const { no } = await params;
  const school = CORRESPONDENCE_HIGH_SCHOOLS.find((s) => s.no === Number(no)) || null;

  const name = school?.name || '';
  const location = school ? `本校：${school.prefecture}${school.municipality}` : '';

  const logoData = await readFile(join(process.cwd(), 'public/assets/sensei_logo.png'), 'base64');
  const logoSrc = `data:image/png;base64,${logoData}`;

  const fontData = await loadGoogleFont(`どうする先生不登校編通信制高校本校${name}${location}`);

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
              background: '#E3EAFD',
              color: '#3652B0',
              fontSize: 30,
              fontWeight: 700,
              padding: '10px 28px',
              borderRadius: 999,
            }}
          >
            通信制高校
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: name.length > 20 ? 56 : 66,
              fontWeight: 800,
              lineHeight: 1.4,
              color: '#2B2B28',
            }}
          >
            {name || '学校紹介'}
          </div>
          {location && (
            <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, color: '#6B6B63' }}>{location}</div>
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
