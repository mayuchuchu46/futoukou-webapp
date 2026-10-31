import { SENPAI_CREDENTIAL } from './config';

// 専門家の「本名」（name、本人確認用。運営のみが参照）と「表示名」（display_name、
// 相談者に公開される名前）を分離している（2026-10-13追加）。表示名が未設定の場合は
// 本名をそのまま公開表示に使う。本人確認・支払いなど運営向けの処理では、この関数を使わず
// 常に name（本名）をそのまま使うこと。
export function expertDisplayName(expert: { name: string; display_name?: string | null }): string {
  return (expert.display_name && expert.display_name.trim()) || expert.name;
}

// 専門家（公認心理師など）か先輩保護者（経験者）かを表す短い呼び名。
// 「専門家の回答」固定表記や、SNSシェア文の「◯◯が出した答え」のような文に
// 使う（2026-10-31追加）。
export function answererName(credential: string | null | undefined): string {
  return credential === SENPAI_CREDENTIAL ? '先輩保護者' : '専門家';
}

// 専門家（公認心理師など）か先輩保護者（経験者）かで、回答欄の見出し文言を
// 出し分ける（2026-10-31、「専門家の回答ではなく、先輩保護者の回答みたいな
// 書き方がいい」との指摘を受けて追加）。本人確認が完了する前（locked状態）でも
// credentialの情報自体は既に渡せるため、ロック中のラベルにもそのまま使う。
export function answerSectionLabel(credential: string | null | undefined): string {
  return `${answererName(credential)}の回答`;
}

// 先輩保護者（経験者）が、まさにその質問で話題になっている学校を「話せる学校」
// （experienced_school_names）として登録している場合、「先輩保護者」という
// 一般的な呼び方ではなく「〇〇の先輩保護者」のように、その学校を知っている人だと
// 一目でわかる呼び方にする（2026-10-31、「その先輩保護者がその学校のことを
// 知ってる人だという感じがわかるテキストにしたい」との指摘を受けて追加）。
// 一致しない場合（専門家の場合・学校名が無関係な場合）は、従来どおりの
// answererName()にフォールバックする。
export function schoolAwareAnswererName(
  question: string,
  credential: string | null | undefined,
  experiencedSchoolNames: string[] | null | undefined
): string {
  if (credential === SENPAI_CREDENTIAL && experiencedSchoolNames && experiencedSchoolNames.length > 0) {
    const matched = experiencedSchoolNames.find((name) => name.trim().length > 3 && question.includes(name.trim()));
    if (matched) return `${matched.trim()}の先輩保護者`;
  }
  return answererName(credential);
}

export function schoolAwareAnswerSectionLabel(
  question: string,
  credential: string | null | undefined,
  experiencedSchoolNames: string[] | null | undefined
): string {
  return `${schoolAwareAnswererName(question, credential, experiencedSchoolNames)}の回答`;
}

// 専門家・先輩保護者の回答がロック中（会員登録・本人以外）でも、何も見えない
// ぼかし線だけだと「続きが気になる」感じが弱いため、最初の1行だけは実際の本文を
// 見せ、残りをぼかす（2026-10-31、「ボカシは最初の1行だけみせるのどう？」との
// 提案を受けて追加）。改行・句点（。）のどちらか早い方で区切り、見つからなければ
// 全体の冒頭maxLen文字で区切る。
export function answerFirstLineSnippet(text: string, maxLen = 60): string {
  const trimmed = text.trim();
  const newlineIdx = trimmed.indexOf('\n'); // 改行の直前で切る（改行自体は含めない）
  const periodIdx = trimmed.indexOf('。'); // 句点は含めて切る
  const cutCandidates = [
    newlineIdx >= 0 ? newlineIdx : null,
    periodIdx >= 0 ? periodIdx + 1 : null,
  ].filter((n): n is number => n !== null);
  const cutAt = cutCandidates.length > 0 ? Math.min(...cutCandidates) : trimmed.length;
  const line = trimmed.slice(0, cutAt);
  return line.length > maxLen ? `${line.slice(0, maxLen)}…` : line;
}
