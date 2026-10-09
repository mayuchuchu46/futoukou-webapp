import { createClient } from '@supabase/supabase-js';

// サーバー側(API route等)専用。service_role keyを使うのでクライアントには渡さない。
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabaseの環境変数が設定されていません (.env.local を確認)');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
