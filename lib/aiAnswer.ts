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
//
// 【2026-10-28追記】web_search撤去後も「回答が文の途中で切れる」report が別件で発生
// （例：NHK学園高等学校の相談で「問い合わせの際に」で切れて終わる）。原因は、
// lib/schoolFacts.ts・lib/facilityLinkMatch.tsのプロンプトが学校固有の事実を具体的に
// 盛り込むよう強く指示するようになったことで、回答が従来より長くなりやすくなり、
// 600トークンの上限に単純に収まりきらないケースが増えたため（web_searchとは無関係の
// 別原因）。max_tokensを900に引き上げ、かつmax_tokens到達で打ち切られた場合は、
// 文の途中で終わる見た目にならないよう、最後の句点等までに切り詰める防御策を追加した。
const MODEL = 'claude-sonnet-5';
const MAX_TOKENS = 900;

function extractText(content: Anthropic.Messages.ContentBlock[]): string {
  return content
    .filter((b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();
}

// max_tokensで打ち切られた場合、最後の文が尻切れ（「〜の際に」で終わる等）のまま
// ユーザーに表示されてしまうのを避けるため、最後の文末記号（。！？）までに切り詰める。
// 文末記号が全く見つからない場合（非常に短い応答が丸ごと切れた等）は、見た目を変えずに
// そのまま返す（中身が空になるよりはまし、かつ稀なケースのため）。
function trimToLastSentence(text: string): string {
  const lastEnd = Math.max(text.lastIndexOf('。'), text.lastIndexOf('！'), text.lastIndexOf('？'));
  if (lastEnd === -1) return text;
  return text.slice(0, lastEnd + 1);
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

  let answer = extractText(msg.content);

  if (!answer) {
    throw new Error(
      `empty response (stop_reason=${msg.stop_reason}, blocks=${msg.content.map((b) => b.type).join(',')})`
    );
  }

  if (msg.stop_reason === 'max_tokens') {
    answer = trimToLastSentence(answer);
  }

  return answer;
}
