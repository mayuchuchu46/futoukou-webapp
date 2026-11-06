import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { analyzeKotoba, CRISIS_PRECHECK_WORDS, CRISIS_FALLBACK_MESSAGE } from '@/lib/kotobaHonyaku';
import { checkKotobaHonyakuRateLimit, recordKotobaHonyakuRequest, getClientIp } from '@/lib/rateLimit';

// 「子供の言葉、ほんとはこう」機能のAPI（2026-11-06追加）。ログイン不要のミニツールの
// ため author_id は必須にせず、lib/uid.ts の匿名ブラウザID（uid、任意）とIPで
// レート制限する。危険信号の一次フィルタはクライアント側（app/kotoba/KotobaClient.tsx）
// と同じものをサーバー側でも実施し、ヒットした場合はAIを呼ばずに即時応答する
// （コスト削減 + クライアント側フィルタが何らかの理由で効かなかった場合の保険）。
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

  const precheckHit = CRISIS_PRECHECK_WORDS.some((w) => trimmed.includes(w));
  if (precheckHit) {
    return NextResponse.json({
      is_crisis: true,
      is_fallback: false,
      interpretations: [],
      crisis_message: CRISIS_FALLBACK_MESSAGE,
    });
  }

  const limit = await checkKotobaHonyakuRateLimit(typeof uid === 'string' ? uid : null, ip);
  if (!limit.ok) {
    return NextResponse.json({ error: limit.message }, { status: 429 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    const result = await analyzeKotoba(anthropic, trimmed);
    recordKotobaHonyakuRequest(typeof uid === 'string' ? uid : null, ip);
    return NextResponse.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: '判定に失敗しました: ' + message }, { status: 502 });
  }
}
