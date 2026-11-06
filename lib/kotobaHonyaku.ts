import Anthropic from '@anthropic-ai/sdk';

// 「子供の言葉、ほんとはこう」機能（トップの入口ミニツール、2026-11-06追加）。
// 子供が言った言葉を入力すると、考えられる心理解釈と親としての返し方を提示する。
// ログイン不要・会員登録前の入口として、相談（/ask）や専門家質問への導線にする想定。
//
// 他の軽量タスク（lib/themeSummary.ts等）と同様にclaude-haiku-5-5を使用。2026-10-30の
// 不具合（haikuがデフォルトで拡張思考を使い、max_tokensをthinkingブロックだけで
// 使い切って本文が空になる）と同じ対策で、thinkingは明示的に無効化する。

export const KOTOBA_HONYAKU_SYSTEM_PROMPT = `あなたは「どうする先生」の一機能として、不登校・学校生活に悩む子を持つ保護者向けに、
子供が言った言葉から考えられる心理状態を解釈し、親としての返し方のヒントを提示するアシスタントです。

# 最優先の安全ルール
この機能に入力される言葉は、そもそも「親が心配になるような、強い・物騒な言い回し」が
中心です。子供や思春期特有の誇張表現（「〜したい」「〜してやる」等の強い言い回し）を
片っ端から crisis にしてしまうと、この機能の価値（心配になる言葉の意味を読み解く）が
失われてしまいます。そのため is_crisis は、以下に当てはまる場合に限定してください。

is_crisis を true にするのは、次のように「自分の命を絶つ・自分を傷つける」ことを
具体的に示す言葉だけです：
- 「死にたい」「自殺したい」「消えたい（自分が消えてなくなりたいという意味で）」
  「いなくなりたい」「生きてる意味がない」「もう終わりにしたい」など、自分の死や
  自傷に直接結びつく表現
- 自傷・自殺の具体的な方法や計画を示す表現

次のような言葉は is_crisis にせず、通常の解釈として扱ってください（これらは
「親が心配になる言葉」の典型例であり、この機能が本来扱うべき対象です）：
- 「爆破したい」「ぶっ壊したい」「全部終わらせたい（破壊・リセットの意味合いが
  強く、自死と断定できない場合）」「殺してやる」など、怒りやフラストレーションの
  誇張表現で、自分の命や自傷に直接向いていないもの
- 「生まれたくなかった」「自分なんていない方がいい」「生まれてこなければよかった」
  など、自己否定・存在否定の強い言葉（今すぐの自死・自傷の表明ではないため）
- その他、物騒に聞こえるが具体的に自分の命・身体を対象にしていない表現

判断に迷う場合、自分の命・身体に直接向いた具体的な言葉かどうかを基準にしてください。
曖昧な誇張表現や存在否定は crisis にせず、通常解釈の中で深刻さに応じて専門家相談を
勧める形で対応してください。
is_crisis を true にする場合、通常の心理解釈を一切行わないでください（他の相談機能と
同様、crisis_messageの文言はAPI側で固定文に統一するため、ここでは内容を気にせず
構いません）。

# 通常時の出力方針
- 診断や断定はしない。「〜かもしれません」という可能性の提示にとどめる。
- 同じ言葉でも背景によって意味が異なることを前提に、できれば異なる解釈を2つ提示する（可能なら）。
- それぞれの解釈に「見分けるヒント（どんな状況・様子だとこの解釈に近いか）」を付ける。
- 親としての返し方は「こう返すとよい」と「避けたい返し方」の両方を具体的な言い回しで出す。
- 入力が短すぎる・一般的すぎて解釈できない場合は is_fallback を true にする。
- 子供を一方的に問題視したり、親を一方的に責めたりしない。
- 文体は温かく、専門用語を避け、保護者が読んでそのまま実践できる言葉にする。
- 「生まれたくなかった」「爆破したい」など、強い自己否定や破壊的な言い回しだが
  is_crisis に当たらない場合は、解釈の中で、様子が続く・頻度が高いようなら学校や
  専門家に相談することを穏やかに勧める一文を response_do に含めてください。

出力はtoolを使って返してください。`;

export const KOTOBA_HONYAKU_TOOL: Anthropic.Tool = {
  name: 'submit_kotoba_analysis',
  description: '子供の言葉の分析結果を構造化して返す',
  input_schema: {
    type: 'object',
    properties: {
      is_crisis: {
        type: 'boolean',
        description: '自殺・自傷・消滅願望を示唆する内容が含まれる場合true',
      },
      is_fallback: {
        type: 'boolean',
        description: '情報不足で解釈できない場合true',
      },
      interpretations: {
        type: 'array',
        description: 'is_crisis・is_fallbackがfalseの場合の解釈リスト（1〜2件）',
        items: {
          type: 'object',
          properties: {
            tag: { type: 'string', description: '解釈の短いラベル（例: 体やこころが先に反応している）' },
            psychology: { type: 'string', description: '考えられる心理状態の説明（2〜3文）' },
            sign: { type: 'string', description: 'この解釈に近いかどうかを見分けるヒント' },
            response_do: { type: 'string', description: '親としての推奨される返し方（具体的な言い回し）' },
            response_avoid: { type: 'string', description: '避けたい返し方（具体例）' },
          },
          required: ['tag', 'psychology', 'sign', 'response_do', 'response_avoid'],
        },
      },
    },
    required: ['is_crisis', 'is_fallback', 'interpretations'],
  },
};

// クライアント側でも同じリストで一次チェックする（app/kotoba/KotobaClient.tsx）。
// AI判定に完全に委ねず、キーワードヒット時はAIを呼ばずに即時でcrisis応答にする
// （コスト削減 + 見逃しを防ぐ安全性の二重化）。
export const CRISIS_PRECHECK_WORDS = [
  '死にたい', '消えたい', 'いなくなりたい', '生きてる意味', '生きる意味ない',
  'もういい終わりに', '自分なんていなくなれば', '死んだほうが',
];

// 他の相談機能（lib/prompt.ts、app/api/consult/route.ts）と窓口情報・文言を統一する。
// AIにメッセージ文面まで生成させず、ここで固定文を返す（既存のCrisisModalが表示する
// 窓口と揃える）。
export const CRISIS_FALLBACK_MESSAGE =
  'すぐに専門の窓口に相談してください。一人で抱え込まず、24時間子供SOSダイヤルやよりそいホットラインにつないでください。';

export type KotobaInterpretation = {
  tag: string;
  psychology: string;
  sign: string;
  response_do: string;
  response_avoid: string;
};

export type KotobaAnalysisResult = {
  is_crisis: boolean;
  is_fallback: boolean;
  crisis_message?: string;
  interpretations: KotobaInterpretation[];
};

// 2026-11-07、max_tokens=800で運用を開始したところstop_reason=max_tokensで
// 解釈JSONが途中で打ち切られ、interpretationsが空のまま返る不具合が発生した
// （クライアント側の.mapが未定義配列に対して呼ばれ、ページごとクラッシュする
// 二次被害も確認）。日本語で2件の解釈（各5フィールド）を構造化出力するには
// 800トークンでは不足していたため1600に引き上げて解消した。
export async function analyzeKotoba(anthropic: Anthropic, text: string): Promise<KotobaAnalysisResult> {
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-5-5',
    thinking: { type: 'disabled' },
    max_tokens: 1600,
    system: KOTOBA_HONYAKU_SYSTEM_PROMPT,
    tools: [KOTOBA_HONYAKU_TOOL],
    tool_choice: { type: 'tool', name: 'submit_kotoba_analysis' },
    messages: [{ role: 'user', content: `子供が言った言葉: 「${text}」` }],
  });

  const toolUse = msg.content.find((b): b is Extract<typeof b, { type: 'tool_use' }> => b.type === 'tool_use');
  if (!toolUse) {
    throw new Error(`empty tool_use (stop_reason=${msg.stop_reason})`);
  }
  const result = toolUse.input as KotobaAnalysisResult;

  // crisis_messageの文面はAI出力に委ねず、他の相談機能と揃えた固定文をここで付与する。
  if (result.is_crisis) {
    result.crisis_message = CRISIS_FALLBACK_MESSAGE;
  }

  // max_tokensの引き上げで通常は解消したが、万一また解釈が空で返ってきた場合に
  // クライアント側の.mapがクラッシュしないよう、念のためfallback扱いにしておく
  // （防御的措置。KotobaClient.tsx側もresult.interpretations?.length>0を描画条件に
  // しており二重の防御）。
  if (!result.is_crisis && (!result.interpretations || result.interpretations.length === 0)) {
    result.is_fallback = true;
  }

  return result;
}
