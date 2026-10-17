import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getSupabaseAdmin } from '@/lib/supabase';
import { CATS } from '@/lib/categories';

// 相談詳細ページ（/result/[id]）ごとに、カテゴリ・質問文を載せたOGP画像を動的生成する。
// Xでのシェア時に表示される灰色のプレースホルダー枠をなくすために追加（2026-10-13）。
// 日本語フォントはビルド時にバンドルすると容量が大きくなりすぎるため、
// Google Fontsの「text」パラメータでそのページに実際に使う文字だけに絞った
// サブセットフォントを、リクエスト時に取得する（Satori/ImageResponseのツールチェーンで
// よく使われる方法）。woff2を返されるとSatoriが読めないため、
// woff2非対応として扱われる古いUser-Agentでリクエストし、ttf/otf形式を取得する。
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

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('consultations')
    .select('category, question, one_liner, crisis_detected')
    .eq('id', id)
    .eq('hidden', false)
    .single();

  const catLabel = data ? CATS[data.category]?.label || CATS.other.label : '';
  const questionSource = data ? data.question.replace(/\s+/g, ' ').trim() : '';
  const question = questionSource.length > 60 ? `${questionSource.slice(0, 60)}…` : questionSource;

  // 一言要約（one_liner）がある相談は、Xのカードにもそれを使った格言カードを出す
  // （2026-10-17追加。それまではこのOGP画像が常にカテゴリ＋質問文の表示で、
  // 結果ページに追加したシェアカード画像（/quote-image、プレビュー・保存用）を
  // Xの投稿画面が参照していなかったため、シェアしても一言カードが表示されない
  // 問題があった。XはシェアするURL＝このOGP画像しか見ないため、ここ自体を
  // one_liner対応にする必要があった）。crisis_detectedな回答にはone_linerを
  // 生成していない（app/api/consult/route.ts）ため、ここでも自然に通常デザインになる。
  const oneLiner = data && !data.crisis_detected ? data.one_liner : null;

  const logoData = await readFile(join(process.cwd(), 'public/assets/sensei_logo.png'), 'base64');
  const logoSrc = `data:image/png;base64,${logoData}`;

  // フォントは実際に描画する文字だけに絞って取得する（ブランド名＋カテゴリ＋質問文または一言）。
  const fontData = await loadGoogleFont(`どうする先生不登校編${catLabel}${question}${oneLiner || ''}`);

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
          {catLabel && (
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
              {oneLiner ? `${catLabel}の相談から` : `${catLabel}の相談`}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              fontSize: oneLiner ? 60 : 54,
              fontWeight: oneLiner ? 800 : 700,
              lineHeight: 1.5,
              color: '#2B2B28',
            }}
          >
            {oneLiner || (question ? `「${question}」` : '不登校のご家庭に、次の一手を。')}
          </div>
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
