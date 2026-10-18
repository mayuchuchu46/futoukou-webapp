import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { MANABI_TAYOUKA_GAKKO } from '@/lib/data/manabiTayoukaGakko';

// 学校紹介ページ（/gakko/school/[no]）ごとに、学校名を載せたOGP画像を動的生成する
// （2026-10-19、「各学校の詳細ページもシェアできるボタンほしい。OGP画像も各学校名が
// 入ってるようにできる？」との要望を受けて追加）。/result/[id]/opengraph-image.tsxと
// 同じ仕組み（next/og + Google Fontsのサブセット取得）を踏襲している。
// 学校の実写真は「実在校を誤って表す画像は載せない」方針で使っていない
// （本文中のGoogleマップ埋め込みの説明コメント参照）が、これは実写真ではなく
// ブランドデザインの上に学校名をテキストで載せるだけのカードなので、その方針とは
// 矛盾しない。
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

export const alt = 'どうする先生（不登校編）';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ no: string }> }) {
  const { no } = await params;
  const school = MANABI_TAYOUKA_GAKKO.find((s) => s.no === Number(no)) || null;

  const fullName = school ? `${school.name}${school.branchName ? `（${school.branchName}）` : ''}` : '';
  const location = school ? `${school.prefecture}${school.city}` : '';

  const logoData = await readFile(join(process.cwd(), 'public/assets/sensei_logo.png'), 'base64');
  const logoSrc = `data:image/png;base64,${logoData}`;

  // フォントは実際に描画する文字だけに絞って取得する（ブランド名＋バッジ文言＋学校名＋所在地）。
  const fontData = await loadGoogleFont(`どうする先生不登校編学びの多様化学校${fullName}${location}`);

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
            学びの多様化学校
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: fullName.length > 20 ? 56 : 66,
              fontWeight: 800,
              lineHeight: 1.4,
              color: '#2B2B28',
            }}
          >
            {fullName || '学校紹介'}
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
