import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getSupabaseAdmin } from '@/lib/supabase';
import { CATS } from '@/lib/categories';

// 相談の回答を一言要約した「格言カード」の正方形シェア画像（2026-10-17追加）。
// opengraph-image.tsx（1200x630、XのOGPカード用）とは別に、結果ページから
// 「このカードをシェア」で直接開く/保存する用の1080x1080を返す。
// one_linerが無い相談（この機能の追加前の相談・crisis_detectedな相談）には
// 404を返す（呼び出し側の結果ページでも、one_linerがある場合だけボタンを出す）。
//
// フォント取得・ロゴ読み込みの実装はopengraph-image.tsxと同じ方法を踏襲している
// （日本語フォントはSatoriが読めるttf/otfを、実際に描画する文字だけに絞って
// Google Fontsから都度取得する）。

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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('consultations')
    .select('category, one_liner, crisis_detected, hidden')
    .eq('id', id)
    .single();

  if (!data || data.hidden || data.crisis_detected || !data.one_liner) {
    return new Response('not found', { status: 404 });
  }

  const catLabel = CATS[data.category]?.label || CATS.other.label;
  const oneLiner: string = data.one_liner;

  const logoData = await readFile(join(process.cwd(), 'public/assets/sensei_logo.png'), 'base64');
  const logoSrc = `data:image/png;base64,${logoData}`;

  const fontData = await loadGoogleFont(`どうする先生${catLabel}futoko-dosuru.com${oneLiner}`);

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
          padding: '88px',
          position: 'relative',
          fontFamily: fontData ? 'M PLUS Rounded 1c' : undefined,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -200,
            right: -200,
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: '#DDEEE8',
            opacity: 0.6,
            display: 'flex',
          }}
        />

        <div style={{ display: 'flex', alignSelf: 'flex-start' }}>
          <div
            style={{
              display: 'flex',
              background: '#DDEEE8',
              color: '#3D7E65',
              fontSize: 28,
              fontWeight: 700,
              padding: '10px 26px',
              borderRadius: 999,
            }}
          >
            {catLabel}の相談から
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.6,
              color: '#2B2B28',
              maxWidth: 820,
            }}
          >
            {oneLiner}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', height: 2, background: '#E4DECF' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <img src={logoSrc} width={64} height={64} style={{ borderRadius: '50%' }} />
              <div style={{ display: 'flex', fontSize: 32, fontWeight: 800, color: '#3D7E65' }}>どうする先生</div>
            </div>
            <div style={{ display: 'flex', fontSize: 26, fontWeight: 700, color: '#3D7E65' }}>futoko-dosuru.com</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
      fonts: fontData ? [{ name: 'M PLUS Rounded 1c', data: fontData, style: 'normal', weight: 800 }] : undefined,
    }
  );
}
