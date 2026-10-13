// SEOで使う本番URL。
// 本番ドメイン futoko-dosuru.com が取得済み（2026-10-13）。Vercel側で
// ドメインの追加・DNS設定が済み、環境変数 NEXT_PUBLIC_SITE_URL に
// https://futoko-dosuru.com を設定すればそちらが使われる。未設定の間は
// このファイルのデフォルト値にフォールバックする。
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : '') ||
  'https://futoko-dosuru.com'
).replace(/\/$/, '');

export const SITE_NAME = 'どうする先生';
export const SITE_DESCRIPTION = '不登校の悩みをAIと専門家に相談できるサービス。同じように悩む保護者の相談とその回答を読めます。';
