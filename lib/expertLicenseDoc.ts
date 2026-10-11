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
import { getSupabaseAdmin } from '@/lib/supabase';

export const EXPERT_LICENSE_DOC_BUCKET = 'expert-documents';

export const MAX_LICENSE_DOC_BYTES = 8 * 1024 * 1024; // 8MB

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

export function isAllowedLicenseDocType(type: string): boolean {
  return ALLOWED_TYPES.has(type);
}

// 登録証（本人確認書類）の保管期間：本人確認（verified: true）が完了してからこの日数が
// 経過したら、Storage上の実ファイルを自動削除する。本人確認が完了した事実そのもの
// （verified, verified_at）はデータベースに残すが、氏名・写真等が写った書類の原本は
// 確認目的を終えたら持ち続けない、という方針（supabase_schema.sqlのexpertsテーブル参照）。
export const LICENSE_DOC_RETENTION_DAYS = 30;

// 保管期限（verified_atから LICENSE_DOC_RETENTION_DAYS 日後）を過ぎた登録証を
// Storageから削除し、experts.license_doc_pathをnullにする。
// 専用のバッチ処理基盤を新設する代わりに、運営が日常的に見る管理画面
// （/admin）の表示時に呼び出すことで、追加のスケジューラなしに定期実行に近い動作にしている。
export async function deleteExpiredLicenseDocs(): Promise<void> {
  const supabase = getSupabaseAdmin();
  const cutoff = new Date(Date.now() - LICENSE_DOC_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: experts, error } = await supabase
    .from('experts')
    .select('id, license_doc_path')
    .eq('verified', true)
    .not('license_doc_path', 'is', null)
    .not('verified_at', 'is', null)
    .lt('verified_at', cutoff);

  if (error || !experts || experts.length === 0) return;

  for (const expert of experts) {
    if (!expert.license_doc_path) continue;
    await supabase.storage.from(EXPERT_LICENSE_DOC_BUCKET).remove([expert.license_doc_path]);
    await supabase.from('experts').update({ license_doc_path: null }).eq('id', expert.id);
  }
}
