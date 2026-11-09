import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { analyzeGohoubi } from '@/lib/gohoubi';
import { CRISIS_PRECHECK_WORDS, CRISIS_FALLBACK_MESSAGE } from '@/lib/kotobaHonyaku';
import { checkGohoubiRateLimit, recordGohoubiRequest, getClientIp } from '@/lib/rateLimit';

// 「親のご褒美クラブ」機能のAPI（2026-11-10追加）。/kotobaと同じ、ログイン不要の
// ミニツールパターン。入力内容は保存しない（レート制限用にuid・IPのみgohoubi_logへ
// 記録する。/kotobaのような「みんなの相談」への自動公開もしない。ご褒美提案は
// Q&Aコンテンツではなく、公開前提にすると書きにくくなるため）。
export async function POST(req: NextRequest) {
  const { text, uid } = await req.json();

  if (!text || typeof text !== 'string' || !text.trim()) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY が設定されていません' }, { status: 500 });
  }

  const trimmed = text.trim().slice(0, 300);
  const ip = getClientIp(req);
  const uidStr = typeof uid === 'string' ? uid : null;

  // /kotobaと同じ一次フィルタ。保護者自身の状況説明という入力特性上、「もう無理」
  // 「消えたい」等の自己危機的な表現が入る可能性があるため、AI呼び出し前にここで
  // 弾き、既存のCrisisModal・窓口案内と同じ固定文を返す。
  const precheckHit = CRISIS_PRECHECK_WORDS.some((w) => trimmed.includes(w));
  if (precheckHit) {
    return NextResponse.json({
      is_crisis: true,
      is_fallback: false,
      suggestions: [],
      encouragement: '',
      crisis_message: CRISIS_FALLBACK_MESSAGE,
    });
  }

  const limit = await checkGohoubiRateLimit(uidStr, ip);
  if (!limit.ok) {
    return NextResponse.json({ error: limit.message }, { status: 429 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    const result = await analyzeGohoubi(anthropic, trimmed);
    recordGohoubiRequest(uidStr, ip);
    return NextResponse.json({ is_crisis: false, ...result });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: '提案の生成に失敗しました: ' + message }, { status: 502 });
  }
}
