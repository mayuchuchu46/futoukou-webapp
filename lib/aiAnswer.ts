import Anthropic from '@anthropic-ai/sdk';

// AIの相談回答を生成する共通処理（2026-10-24追加）。
//
// /api/consult・/api/consult-followup・/api/admin/consultations/regenerate-answer の
// 3箇所が同じロジックをそれぞれ持っていたのを1箇所にまとめた。
//
// 【2026-10-21〜10-28：web_search関連の経緯】
// 2026-10-21、「学びの多様化学校」一覧に載っていない学校名（例：「ヒロック初等部」）
// についても個別の学校情報を答えられるよう、web_searchツール（max_uses: 2）を追加した。
// しかしこれにより、検索結果のテキストも入力トークンとして課金対象になり、1件あたりの
// APIコストが大きく増加（Claude Consoleの使用量グラフで10/21〜の急増として確認）。
// ユーザーからの実投稿数はさほど増えていないにもかかわらず月$15〜20規模のコストに
// なっており、この段階ではコストに見合わないと判断し、2026-10-28、web_searchを撤去した。
// 学校の個別情報は引き続きlib/schoolFacts.ts（静的データ）でカバーし、載っていない学校は
// 一般的な回答＋/gakko（学校一覧ページ）への案内にフォールバックする（元々の仕組み）。
// web_search起因だった「検索結果に予算を取られて回答が尻切れになる」不具合も、検索自体を
// やめたことで解消するため、max_tokensは元の600に戻し、リトライ処理も不要になったので削除した。
const MODEL = 'claude-sonnet-5';
const MAX_TOKENS = 600;

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
  });

  const answer = extractText(msg.content);

  if (!answer) {
    throw new Error(
      `empty response (stop_reason=${msg.stop_reason}, blocks=${msg.content.map((b) => b.type).join(',')})`
    );
  }

  return answer;
}
