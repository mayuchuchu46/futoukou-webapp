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
    return { ok: false, message: `1日にご利用いただける回数の上限（${AI_CONSULT_USER_DAILY_LIMIT}回）に達しました。また明日お試しください。` };
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
