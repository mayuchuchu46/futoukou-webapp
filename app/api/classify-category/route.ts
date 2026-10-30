import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { CATS, Category } from '@/lib/categories';
import { buildCategoryClassificationPrompt } from '@/lib/prompt';
import { checkAiConsultRateLimit, getClientIp } from '@/lib/rateLimit';

const CATEGORY_KEYS = Object.keys(CATS) as Category[];

// 質問する画面で、相談文の入力に合わせてテーマ（カテゴリ）を自動判定するための
// エンドポイント。コストのかかるAI呼び出しのため、無料AI相談と同じ1日あたりの
// 上限（lib/rateLimit.ts）を共有し、既に上限に達している利用者からの乱用を防ぐ
// （2026-10-13追加）。
export async function POST(req: NextRequest) {
  const { text, author_id } = await req.json();

  if (!text || typeof text !== 'string' || text.trim().length < 5 || !author_id) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY が設定されていません' }, { status: 500 });
  }

  const ip = getClientIp(req);
  const limit = await checkAiConsultRateLimit(author_id, ip);
  if (!limit.ok) {
    return NextResponse.json({ error: limit.message }, { status: 429 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-5-5',
      // 2026-10-30、claude-haiku-5-5はデフォルトで拡張思考（thinking）が働き、
      // max_tokensの枠をthinkingブロックだけで使い切って本文が空になる不具合が
      // 判明（app/api/consultations/[id]/one-liner/route.tsの調査で発見）。
      // ここも含め軽量タスクでは不要なため、同様に明示的に無効化した。
      thinking: { type: 'disabled' },
      max_tokens: 10,
      messages: [{ role: 'user', content: buildCategoryClassificationPrompt(text.trim()) }],
    });
    const textBlock = msg.content.find((b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text');
    const raw = (textBlock ? textBlock.text : '').trim();
    const matched = CATEGORY_KEYS.find((key) => raw === key || raw.startsWith(key));
    if (!matched) {
      return NextResponse.json({ error: '判定できませんでした' }, { status: 502 });
    }
    return NextResponse.json({ category: matched });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: 'テーマの判定に失敗しました: ' + message }, { status: 502 });
  }
}
