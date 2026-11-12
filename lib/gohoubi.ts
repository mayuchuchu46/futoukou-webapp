import Anthropic from '@anthropic-ai/sdk';

// 「親のご褒美クラブ」機能（2026-11-10追加）。今日あったこと・頑張ったことを一言入れると、
// 今の自分に合ったご褒美（頑張りをねぎらう小さな行動）を提案する。/kotoba（子どもの本音翻訳）
// と同じ「ログイン不要のミニツール」パターンで実装し、他の軽量タスクと同様に
// claude-haiku-5-5・thinking無効を使う（コスト最小化。2026-10-30の不具合対策として
// thinkingは明示的に無効化する）。
//
// /kotobaと違い入力は子どもの言葉ではなく保護者自身の状況説明だが、「もう無理」
// 「消えたい」等の自己危機的な表現が入る可能性はこちらにもあるため、安全策として
// lib/kotobaHonyaku.tsのCRISIS_PRECHECK_WORDS・CRISIS_FALLBACK_MESSAGEをそのまま
// 再利用する（判定ロジックを増やさず、既存の窓口案内と文言を統一するため）。
//
// アフィリエイト連携（2026-11-12追加）：もしもアフィリエイトでfutoko-dosuru.comの
// 楽天市場提携が承認されたことを受け、提案のうち「購入可能なモノ」については
// is_product・shop_keywordを判定させ、GohoubiClient.tsx側で楽天市場の検索リンク
// （lib/rakutenAffiliate.ts）を添える。「お風呂にゆっくり浸かる」のような行動系の
// 提案には出さない（無理に物販に結びつけない）。Amazonは提携審査中のため未実装、
// 承認後に同様の仕組みで追加予定。

export const GOHOUBI_SYSTEM_PROMPT = `あなたは「どうする先生」の一機能「親のご褒美クラブ」として、不登校・学校生活に悩む
子を持つ保護者が今日あったこと・頑張ったことを書いた内容を読み、その保護者自身への
「ご褒美」（頑張りをねぎらうための、小さく実行しやすい行動）を提案するアシスタントです。

# 出力方針
- 診断や説教はしない。保護者の行動や子育てを評価・採点するような言い方をしない。
- 提案するご褒美は、今すぐ・安価に・一人でできる具体的なものにする（例：コンビニの
  ちょっといいスイーツ、好きな音楽を聴きながら10分だけ一人になる、お風呂にゆっくり
  浸かる、好きな漫画・ドラマを1話見る）。高額な買い物・旅行・飲酒をすすめる提案は避ける。
- 提案は2〜3件。それぞれに短いタイトルと、入力内容のどの部分を受けてこの提案に
  至ったかが伝わる理由（1〜2文）を付ける。理由は入力内容に具体的に触れること
  （テンプレート的な一般論にしない）。
- 提案の中に、購入可能な具体的な商品（お菓子・入浴剤・コーヒー・文房具等）であるものが
  自然に含まれる場合は is_product を true にし、楽天市場で検索するのに適した短い
  キーワード（shop_keyword、例：「入浴剤」「ドリップコーヒー」）を付ける。
  「10分だけ一人になる」のような行動・体験の提案には is_product を true にしない
  （無理に物販に結びつけない。該当なしで構わない）。
- 提案全体とは別に、今日の頑張りをねぎらう一言（encouragement、1〜2文）を付ける。
  「よくやっている」と決めつけるのではなく、書かれた内容に即した労い方にする。
- 入力が短すぎる・ご褒美を考える材料にならない場合（例：空白に近い、意味不明な文字列）は
  is_fallback を true にし、suggestions は空配列にする。
- 文体は温かく、保護者が読んでそのまま実践できる言葉にする。説教くさい表現・
  「〜すべき」という言い方は避ける。

出力はtoolを使って返してください。`;

export const GOHOUBI_TOOL: Anthropic.Tool = {
  name: 'submit_gohoubi_suggestions',
  description: '親へのご褒美提案を構造化して返す',
  input_schema: {
    type: 'object',
    properties: {
      is_fallback: {
        type: 'boolean',
        description: '入力内容からご褒美を考える材料が無い場合true',
      },
      encouragement: {
        type: 'string',
        description: '今日の頑張りをねぎらう一言（is_fallbackがtrueの場合は空文字でよい）',
      },
      suggestions: {
        type: 'array',
        description: 'is_fallbackがfalseの場合のご褒美提案（2〜3件）',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'ご褒美の短いタイトル（例：コンビニのちょっといいスイーツ）' },
            category: { type: 'string', description: 'タグ（例：ひとり時間／五感を癒す／頑張りを認める）' },
            reason: { type: 'string', description: '入力内容のどの部分を受けてこの提案になったかの説明（1〜2文）' },
            is_product: { type: 'boolean', description: '購入可能な具体的な商品の提案である場合true（行動・体験の提案はfalse）' },
            shop_keyword: { type: 'string', description: 'is_productがtrueの場合のみ：楽天市場で検索するのに適した短いキーワード' },
          },
          required: ['title', 'category', 'reason', 'is_product'],
        },
      },
    },
    required: ['is_fallback', 'encouragement', 'suggestions'],
  },
};

export type GohoubiSuggestion = {
  title: string;
  category: string;
  reason: string;
  is_product?: boolean;
  shop_keyword?: string;
};

export type GohoubiResult = {
  is_fallback: boolean;
  encouragement: string;
  suggestions: GohoubiSuggestion[];
};

export async function analyzeGohoubi(anthropic: Anthropic, text: string): Promise<GohoubiResult> {
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-5-5',
    thinking: { type: 'disabled' },
    max_tokens: 1200,
    system: GOHOUBI_SYSTEM_PROMPT,
    tools: [GOHOUBI_TOOL],
    tool_choice: { type: 'tool', name: 'submit_gohoubi_suggestions' },
    messages: [{ role: 'user', content: `今日あったこと・頑張ったこと: 「${text}」` }],
  });

  const toolUse = msg.content.find((b): b is Extract<typeof b, { type: 'tool_use' }> => b.type === 'tool_use');
  if (!toolUse) {
    throw new Error(`empty tool_use (stop_reason=${msg.stop_reason})`);
  }
  const result = toolUse.input as GohoubiResult;

  // /kotobaと同じ防御的措置。suggestionsが空で返ってきた場合はfallback扱いにして、
  // クライアント側の.mapがクラッシュしないようにする。
  if (!result.is_fallback && (!result.suggestions || result.suggestions.length === 0)) {
    result.is_fallback = true;
  }

  return result;
}
