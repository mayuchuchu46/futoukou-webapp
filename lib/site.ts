// SEOで使う本番URL。
// TODO: 本番ドメインが決まったら Vercel の環境変数 NEXT_PUBLIC_SITE_URL に
//       実際のURL（例: https://dousuru-sensei.com）を設定してください。
//       未設定の間は Vercel の自動付与ドメインにフォールバックします。
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : '') ||
  'https://dousuru-sensei.vercel.app'
).replace(/\/$/, '');

export const SITE_NAME = 'どうする先生';
export const SITE_DESCRIPTION = '不登校の悩みをAIと専門家に相談できるサービス。同じように悩む保護者の相談とその回答を読めます。';
