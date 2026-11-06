import { NextRequest, NextResponse, after } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { analyzeKotoba, buildKotobaConsultationText, CRISIS_PRECHECK_WORDS, CRISIS_FALLBACK_MESSAGE } from '@/lib/kotobaHonyaku';
import { checkKotobaHonyakuRateLimit, recordKotobaHonyakuRequest, checkExpertRequestRateLimit, getClientIp } from '@/lib/rateLimit';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildCategoryClassificationPrompt } from '@/lib/prompt';
import { CATS, Category } from '@/lib/categories';
import { notifyExpertsOfNewPending } from '@/lib/expertNotify';

const CATEGORY_KEYS = Object.keys(CATS) as Category[];

// crisisでも空振りでもない通常の解釈結果を、/api/classify-categoryと同じ方式でテーマを
// 判定した上で「みんなの相談」（consultationsテーブル）に公開投稿する（2026-11-07追加、
// 「相談するページに統合」「TOPの一覧にも流せられるといいな」との要望を受けて、kotoba
// 単独では閉じていたコンテンツをサイト本体の相談一覧に合流させる）。失敗しても解釈結果
// 自体の表示は止めたくないため、ここで起きた例外は呼び出し側で握りつぶす。
async function publishKotobaAsConsultation(
  anthropic: Anthropic,
  childText: string,
  result: Parameters<typeof buildKotobaConsultationText>[1],
  uid: string | null,
  ip: string | null,
  wantExpert: boolean
): Promise<string | null> {
  const { question, answer } = buildKotobaConsultationText(childText, result);

  let category: Category = 'other';
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-5-5',
      thinking: { type: 'disabled' },
      max_tokens: 10,
      messages: [{ role: 'user', content: buildCategoryClassificationPrompt(question) }],
    });
    const textBlock = msg.content.find((b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text');
    const raw = (textBlock ? textBlock.text : '').trim();
    const matched = CATEGORY_KEYS.find((key) => raw === key || raw.startsWith(key));
    if (matched) category = matched;
  } catch {
    // 判定に失敗しても「その他」のまま投稿自体は続ける（/ask のresolveCategoryと同じ考え方）。
  }

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase
    .from('consultations')
    .insert({
      category,
      question,
      answer,
      author_id: uid || 'kotoba_anon',
      client_ip: ip,
      // 「専門家への導線を強化したい」（2026-11-07）を受けて、/askの
      // 「専門家・経験者にも回答してもらう」チェックと同じ仕組みをkotobaにも追加。
      // チェックされていれば、通常の相談と同じ回答待ちキューに乗せる。
      ...(wantExpert
        ? { request_type: 'expert', expert_status: 'pending', paid: true, price_jpy: 0, expert_funding: 'volunteer' }
        : {}),
    })
    .select('id')
    .single();

  if (error) throw error;
  return row?.id || null;
}

// 「子供の言葉、ほんとはこう」機能のAPI（2026-11-06追加）。ログイン不要のミニツールの
// ため author_id は必須にせず、lib/uid.ts の匿名ブラウザID（uid、任意）とIPで
// レート制限する。危険信号の一次フィルタはクライアント側（app/kotoba/KotobaClient.tsx）
// と同じものをサーバー側でも実施し、ヒットした場合はAIを呼ばずに即時応答する
// （コスト削減 + クライアント側フィルタが何らかの理由で効かなかった場合の保険）。
export async function POST(req: NextRequest) {
  const { text, uid, wantExpert } = await req.json();

  if (!text || typeof text !== 'string' || !text.trim()) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY が設定されていません' }, { status: 500 });
  }

  const trimmed = text.trim().slice(0, 300);
  const ip = getClientIp(req);
  const uidStr = typeof uid === 'string' ? uid : null;

  const precheckHit = CRISIS_PRECHECK_WORDS.some((w) => trimmed.includes(w));
  if (precheckHit) {
    return NextResponse.json({
      is_crisis: true,
      is_fallback: false,
      interpretations: [],
      crisis_message: CRISIS_FALLBACK_MESSAGE,
    });
  }

  const limit = await checkKotobaHonyakuRateLimit(uidStr, ip);
  if (!limit.ok) {
    return NextResponse.json({ error: limit.message }, { status: 429 });
  }

  // /api/consultと同様、専門家・経験者への質問は乱用防止のため専用のレート制限も
  // かける（2026-11-07追加）。uidが無い場合はこの機能自体を使えないよう扱う。
  if (wantExpert) {
    const expertLimit = await checkExpertRequestRateLimit(uidStr || 'kotoba_anon', ip);
    if (!expertLimit.ok) {
      return NextResponse.json({ error: expertLimit.message }, { status: 429 });
    }
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    const result = await analyzeKotoba(anthropic, trimmed);
    recordKotobaHonyakuRequest(uidStr, ip);

    let consultationId: string | null = null;
    let published = false;
    if (!result.is_crisis && !result.is_fallback && result.interpretations.length > 0) {
      try {
        consultationId = await publishKotobaAsConsultation(anthropic, trimmed, result, uidStr, ip, !!wantExpert);
        published = true;
      } catch {
        // 公開投稿が失敗しても、入力した本人への解釈結果の表示は妨げない。
      }
    }

    if (published && wantExpert && consultationId) {
      const { question } = buildKotobaConsultationText(trimmed, result);
      after(() => notifyExpertsOfNewPending(question));
    }

    return NextResponse.json({ ...result, consultation_id: consultationId });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: '判定に失敗しました: ' + message }, { status: 502 });
  }
}
