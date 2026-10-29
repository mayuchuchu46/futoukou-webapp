// lib/gakkoRanking.ts（サーバー側のみ・Supabase接続＆'use cache'を含む）から型・定数だけを
// 分離したファイル（2026-10-29追加）。components/FeaturedGakkoRanking.tsx（クライアント
// コンポーネント）がlib/gakkoRanking.tsを直接importすると、Supabase接続や'use cache'
// 付き関数までクライアントバンドルに含めようとしてビルドエラーになるため、型・定数のみを
// ここに置いて両方から参照する。
export type FeaturedGakkoType = 'school' | 'free' | 'tsushin' | 'online';

export type FeaturedGakko = {
  key: string;
  type: FeaturedGakkoType;
  no: number;
  name: string;
  href: string;
  count: number;
};

export const FEATURED_GAKKO_TYPE_LABEL: Record<FeaturedGakkoType, string> = {
  school: '学びの多様化学校',
  free: 'フリースクール',
  tsushin: '通信制高校',
  online: 'オンラインフリースクール',
};
