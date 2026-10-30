import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildOneLinerPrompt } from '@/lib/prompt';

// 回答の一言要約（Xシェア用の「格言カード」に使う）を、結果ページで実際に
// 「シェア画像を作る」ボタンが押された時だけオンデマンドで生成するエンドポイント
// （2026-10-30追加）。
//
// 【経緯】以前は/api/consult側で、相談が投稿されるたびに（シェアされるかどうかに
// 関わらず）毎回このAPI呼び出しを行っていた。実際にシェアする人は一部なので、
// 全件で生成するのはAPIコストの無駄だった。オンデマンド化し、生成結果はDBの
// one_liner列にキャッシュする（一度生成すれば、同じ相談への2回目以降のリクエストは
// AIを呼ばずキャッシュをそのまま返す）。
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: item } = await supabase
    .from('consultations')
    .select('question, answer, one_liner, crisis_detected, hidden, request_type')
    .eq('id', id)
    .single();

  if (!item || item.hidden) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  // 命に関わる場面でシェア導線は出さない方針（結果ページのisCrisis分岐と同じ考え方）。
  // 専門家回答（request_type !== 'ai'）も、この格言カード機能の対象外。
  if (item.crisis_detected || item.request_type !== 'ai') {
    return NextResponse.json({ error: 'not applicable' }, { status: 400 });
  }
  if (item.one_liner) {
    return NextResponse.json({ ok: true, one_liner: item.one_liner });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY が設定されていません' }, { status: 500 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  let oneLiner: string | null = null;
  try {
    const oneLinerMsg = await anthropic.messages.create({
      model: 'claude-haiku-5-5',
      // 2026-10-30、「シェアカード作成すると失敗する」との報告を受けて調査したところ、
      // claude-haiku-5-5はデフォルトで拡張思考（thinking）が働き、max_tokensの枠を
      // thinkingブロックだけで使い切ってしまい、本文（textブロック）が一切返らないまま
      // stop_reason: 'max_tokens'で終わっていたことが判明（Anthropicの生レスポンスで
      // content[0].type === 'thinking'のみ、textブロック無しを確認）。この一言要約は
      // 深く考える必要のない軽量タスクなのでthinkingは不要なため、明示的に無効化した。
      thinking: { type: 'disabled' },
      max_tokens: 100,
      messages: [{ role: 'user', content: buildOneLinerPrompt(item.question, item.answer) }],
    });
    const oneLinerBlock = oneLinerMsg.content.find(
      (b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text'
    );
    const raw = oneLinerBlock ? oneLinerBlock.text.trim() : '';
    // 万一「」で囲って返ってきた場合に備えて剥がしておく。
    oneLiner = raw ? raw.replace(/^[「『]|[」』]$/g, '').trim() : null;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: '一言要約の生成に失敗しました: ' + message }, { status: 502 });
  }

  if (!oneLiner) {
    return NextResponse.json({ error: '一言要約の生成に失敗しました' }, { status: 502 });
  }

  const { error: updateErr } = await supabase.from('consultations').update({ one_liner: oneLiner }).eq('id', id);
  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, one_liner: oneLiner });
}
