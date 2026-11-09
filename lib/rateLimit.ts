import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from './supabase';

// 無料AI相談・有料専門家相談、それぞれの乱用・コスト急増を防ぐための簡易レート制限。
// 新しいテーブルは作らず、consultations テーブル自体を数えて判定する（この規模なら十分な精度）。

export function getClientIp(req: NextRequest): string | null {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || null;
}

type LimitResult = { ok: true } | { ok: false; message: string };

async function countSince(filters: { authorId?: string; ip?: string; requestType?: 'ai' | 'expert'; onlyType?: boolean }, sinceIso: string) {
  const supabase = getSupabaseAdmin();
  let query = supabase.from('consultations').select('id', { count: 'exact', head: true }).gte('created_at', sinceIso);
  if (filters.authorId) query = query.eq('author_id', filters.authorId);
  if (filters.ip) query = query.eq('client_ip', filters.ip);
  if (filters.onlyType && filters.requestType) query = query.eq('request_type', filters.requestType);
  const { count } = await query;
  return count || 0;
}

// 無料AI相談（どうする先生）向け：APIコストが直接かかるため厳しめに制限する
const AI_CONSULT_USER_DAILY_LIMIT = 10;
const AI_CONSULT_IP_DAILY_LIMIT = 20;

export async function checkAiConsultRateLimit(authorId: string, ip: string | null): Promise<LimitResult> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const globalCount = await countSince({ requestType: 'ai', onlyType: true }, since);
  if (globalCount >= 300) {
    return { ok: false, message: '本日はご利用が集中しているため、しばらく時間をおいてから再度お試しください。' };
  }

  const userCount = await countSince({ authorId, requestType: 'ai', onlyType: true }, since);
  if (userCount >= AI_CONSULT_USER_DAILY_LIMIT) {
    // 個人単位で10回の上限に実際に当たった人がどれくらいいるかを計測する（2026-10-13）。
    // 「10回を超えてもっと使いたい人」向け有料プランを作るかどうかを、この件数を見てから
    // 判断する。失敗しても案内自体は出したいので、結果を待たずfire-and-forgetにする。
    const supabase = getSupabaseAdmin();
    supabase.from('ai_limit_hits').insert({ author_id: authorId, client_ip: ip }).then(
      () => {},
      () => {}
    );
    return {
      ok: false,
      message: `1日にご利用いただける回数の上限（${AI_CONSULT_USER_DAILY_LIMIT}回）に達しました。また明日お試しください。`,
    };
  }

  if (ip) {
    const ipCount = await countSince({ ip, requestType: 'ai', onlyType: true }, since);
    if (ipCount >= AI_CONSULT_IP_DAILY_LIMIT) {
      return { ok: false, message: '1日にご利用いただける回数の上限に達しました。また明日お試しください。' };
    }
  }

  return { ok: true };
}

// 無料AI相談を、この利用者（author_id）が累計で何回使ったか（全期間）。
// レート制限（直近24時間）とは別物。専門家への送客バナーの表示判定に使う。
export async function countAiConsultationsAllTime(authorId: string): Promise<number> {
  return countSince({ authorId, requestType: 'ai', onlyType: true }, new Date(0).toISOString());
}

// 「子供の言葉、ほんとはこう」機能（ログイン不要のミニツール、2026-11-06追加）向け。
// author_id（ログイン前提）ではなく、lib/uid.ts の匿名ブラウザID（uid）とIPで数える。
// 専用の軽量テーブル（kotoba_honyaku_log）を使い、consultationsテーブルとは分ける。
const KOTOBA_HONYAKU_USER_DAILY_LIMIT = 10;
const KOTOBA_HONYAKU_IP_DAILY_LIMIT = 20;

async function countKotobaHonyakuSince(filters: { uid?: string; ip?: string }, sinceIso: string) {
  const supabase = getSupabaseAdmin();
  let query = supabase.from('kotoba_honyaku_log').select('id', { count: 'exact', head: true }).gte('created_at', sinceIso);
  if (filters.uid) query = query.eq('uid', filters.uid);
  if (filters.ip) query = query.eq('client_ip', filters.ip);
  const { count } = await query;
  return count || 0;
}

export async function checkKotobaHonyakuRateLimit(uid: string | null, ip: string | null): Promise<LimitResult> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const globalCount = await countKotobaHonyakuSince({}, since);
  if (globalCount >= 300) {
    return { ok: false, message: '本日はご利用が集中しているため、しばらく時間をおいてから再度お試しください。' };
  }

  if (uid) {
    const userCount = await countKotobaHonyakuSince({ uid }, since);
    if (userCount >= KOTOBA_HONYAKU_USER_DAILY_LIMIT) {
      return {
        ok: false,
        message: `1日にご利用いただける回数の上限（${KOTOBA_HONYAKU_USER_DAILY_LIMIT}回）に達しました。また明日お試しください。`,
      };
    }
  }

  if (ip) {
    const ipCount = await countKotobaHonyakuSince({ ip }, since);
    if (ipCount >= KOTOBA_HONYAKU_IP_DAILY_LIMIT) {
      return { ok: false, message: '1日にご利用いただける回数の上限に達しました。また明日お試しください。' };
    }
  }

  return { ok: true };
}

// 実際にAI呼び出しが発生したリクエストだけを記録する（危険信号の一次フィルタで
// AIを呼ばずに済んだ場合は記録しない）。失敗してもレスポンスを遅らせたくないため
// fire-and-forgetにする。
export function recordKotobaHonyakuRequest(uid: string | null, ip: string | null) {
  const supabase = getSupabaseAdmin();
  supabase.from('kotoba_honyaku_log').insert({ uid, client_ip: ip }).then(
    () => {},
    () => {}
  );
}

// 「親のご褒美クラブ」機能（ログイン不要のミニツール、2026-11-10追加）向け。
// /kotobaと同じ考え方で、専用の軽量テーブル（gohoubi_log）をuid・IPで数える。
const GOHOUBI_USER_DAILY_LIMIT = 10;
const GOHOUBI_IP_DAILY_LIMIT = 20;

async function countGohoubiSince(filters: { uid?: string; ip?: string }, sinceIso: string) {
  const supabase = getSupabaseAdmin();
  let query = supabase.from('gohoubi_log').select('id', { count: 'exact', head: true }).gte('created_at', sinceIso);
  if (filters.uid) query = query.eq('uid', filters.uid);
  if (filters.ip) query = query.eq('client_ip', filters.ip);
  const { count } = await query;
  return count || 0;
}

export async function checkGohoubiRateLimit(uid: string | null, ip: string | null): Promise<LimitResult> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const globalCount = await countGohoubiSince({}, since);
  if (globalCount >= 300) {
    return { ok: false, message: '本日はご利用が集中しているため、しばらく時間をおいてから再度お試しください。' };
  }

  if (uid) {
    const userCount = await countGohoubiSince({ uid }, since);
    if (userCount >= GOHOUBI_USER_DAILY_LIMIT) {
      return {
        ok: false,
        message: `1日にご利用いただける回数の上限（${GOHOUBI_USER_DAILY_LIMIT}回）に達しました。また明日お試しください。`,
      };
    }
  }

  if (ip) {
    const ipCount = await countGohoubiSince({ ip }, since);
    if (ipCount >= GOHOUBI_IP_DAILY_LIMIT) {
      return { ok: false, message: '1日にご利用いただける回数の上限に達しました。また明日お試しください。' };
    }
  }

  return { ok: true };
}

export function recordGohoubiRequest(uid: string | null, ip: string | null) {
  const supabase = getSupabaseAdmin();
  supabase.from('gohoubi_log').insert({ uid, client_ip: ip }).then(
    () => {},
    () => {}
  );
}

// 有料の専門家相談向け：決済が絡むため緩めだが、連打・スパムは防ぐ
export async function checkExpertRequestRateLimit(authorId: string, ip: string | null): Promise<LimitResult> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const userCount = await countSince({ authorId, requestType: 'expert', onlyType: true }, since);
  if (userCount >= 5) {
    return { ok: false, message: '1日にご依頼いただける件数の上限に達しました。また明日お試しください。' };
  }

  if (ip) {
    const ipCount = await countSince({ ip, requestType: 'expert', onlyType: true }, since);
    if (ipCount >= 10) {
      return { ok: false, message: '1日にご依頼いただける件数の上限に達しました。また明日お試しください。' };
    }
  }

  return { ok: true };
}
