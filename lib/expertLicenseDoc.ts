// 専門家登録時に提出してもらう「登録証」（資格証明書）のファイル管理設定。
//
// 資格の登録番号は自己申告の文字列だけでは真偽を確認できず、かつ公的な番号照会
// システムも見当たらなかったため、登録証そのもの（画像／PDF）の提出を必須にし、
// 運営が目視で本人確認する方式にした。
//
// 個人情報保護の観点から、ファイルはSupabase Storageの非公開バケット
// （EXPERT_LICENSE_DOC_BUCKET、public: false）に保存し、一般ユーザー・他の専門家
// からは一切アクセスできないようにする。運営が内容を確認する際は、管理画面
// （/admin、パスワード保護）から短時間だけ有効な署名付きURLを発行して閲覧する
// （/api/admin/experts/doc-url）。
export const EXPERT_LICENSE_DOC_BUCKET = 'expert-documents';

export const MAX_LICENSE_DOC_BYTES = 8 * 1024 * 1024; // 8MB

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

export function isAllowedLicenseDocType(type: string): boolean {
  return ALLOWED_TYPES.has(type);
}
