import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { MIMAMORI_RESULTS, type MimamoriType } from '@/lib/mimamoriShindan';

// 診断結果（タイプ）ごとのOGP画像（2026-11-01追加）。当初はnext/og（Satori）で
// テキストを動的合成していたが、2026-11-01にタイプ名・キャッチコピーまで作り込み済みの
// 完成画像（public/assets/shindan/mimamori-*.jpg、ChatGPTで作成）に差し替えた。
// ここではフォント取得・レイアウト計算をせず、完成画像をそのまま1200x675で返すだけ
// （結果ページ本体の表示画像と共通のファイルを使っている）。
// タイプは4種類のみ・内容も固定のため、generateStaticParamsで全件ビルド時に
// プリレンダーする（アクセスごとのサーバー処理は発生しない）。
const TYPES = Object.keys(MIMAMORI_RESULTS) as MimamoriType[];

export function generateStaticParams() {
  return TYPES.map((type) => ({ type }));
}

export const alt = '見守り力タイプ診断（どうする先生）';
export const size = { width: 1200, height: 675 };
export const contentType = 'image/jpeg';

export default async function Image({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const result = MIMAMORI_RESULTS[type as MimamoriType] ?? MIMAMORI_RESULTS.port;

  const imageData = await readFile(join(process.cwd(), 'public', result.image));
  const imageSrc = `data:image/jpeg;base64,${imageData.toString('base64')}`;

  return new ImageResponse(
    (
      <img
        src={imageSrc}
        width={size.width}
        height={size.height}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    ),
    size
  );
}
