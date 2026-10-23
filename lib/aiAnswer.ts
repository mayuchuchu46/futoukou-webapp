import Anthropic from '@anthropic-ai/sdk';

// AIの相談回答を生成する共通処理（2026-10-24追加）。
//
// /api/consult・/api/consult-followup・/api/admin/consultations/regenerate-answer の
// 3箇所が同じロジック（web_search付きでAnthropicを呼び、複数のtextブロックを結合する）を
// それぞれ持っていたのを1箇所にまとめた。まとめる過程で、以下の不具合を修正している：
//
// web_search有効化後、検索結果のテキストも出力トークン予算（max_tokens）を消費するため、
// 600トークンでは回答本文を書く前に打ち切られる不具合があり、2026-10-21に1500へ増やして
// 対応していた。しかし「学びの多様化学校」一覧に載っていない学校名（例：「ヒロック初等部」）
// について聞かれた場合など、AIが複数回検索して長い検索結果を読み込むケースでは、1500でも
// 検索結果だけで予算の大半を使い切り、本来200〜250字程度のはずの回答本文が「「本人のペース」
// のような中途半端な場所で切れてしまう不具合が2026-10-24に実際のユーザー投稿で発覚した。
// stop_reason==='max_tokens'（トークン予算切れで打ち切られた）場合、検索結果が予算を
// 奪っていないプレーンな再生成（web_searchツールなし）に切り替えることで、短い回答文自体は
// 確実に書き切れるようにした。
const MODEL = 'claude-sonnet-5';
const MAX_TOKENS = 1500;

function extractText(content: Anthropic.Messages.ContentBlock[]): string {
  return content
    .filter((b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();
}

export async function generateConsultAnswer(
  anthropic: Anthropic,
  prompt: string
): Promise<string> {
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: 'user', content: prompt }],
    tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 2 }],
  });

  let answer = extractText(msg.content);

  // 検索結果にトークン予算を取られて本文が尻切れになった場合、検索なしで
  // 同じプロンプトを再実行する（上記コメント参照）。
  if (msg.stop_reason === 'max_tokens') {
    const retryMsg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: prompt }],
    });
    const retryAnswer = extractText(retryMsg.content);
    if (retryAnswer) {
      answer = retryAnswer;
    }
  }

  if (!answer) {
    throw new Error(
      `empty response (stop_reason=${msg.stop_reason}, blocks=${msg.content.map((b) => b.type).join(',')})`
    );
  }

  return answer;
}
