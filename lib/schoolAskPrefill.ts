// 相談結果ページ（app/result/[id]/page.tsx）のgenerateMetadataで、学校詳細ページの
// 「相談する」ボタン経由で作られた相談のtitle・descriptionから、中身の無い定型文を
// 取り除くための処理（2026-10-29追加）。
//
// きっかけ：学校詳細ページ（/gakko/school, /gakko/free, /gakko/online, /gakko/tsushin,
// /gakko/teiji, /gakko/alternative）の「相談する」ボタンは、かつて「「学校名」が
// うちの子に合うかどうか知りたいです。」のあとに「子どもの特徴：（…）」という
// プレースホルダー文言を/askの入力欄に直接差し込んでいた。generateMetadataは質問文の
// 先頭48文字をそのままtitle・descriptionに使っていたため、このプレースホルダー文言
// だけで48文字の大半を使い切ってしまい、同じ学校について複数の保護者が相談するたびに、
// 実際に書き足した内容（本来ページごとに差があるはずの部分）が一切タイトルに反映され
// ないまま、同じ学校の相談ページ同士でtitle・descriptionがほぼ丸ごと重複するという
// 構造的な問題があった。「相談の聞き方が毎回同じだとSEO的によくない？」との指摘を
// 受けて調査し発覚。
//
// その後、この指摘とは別に、プレースホルダー文言を入力欄の本文に差し込むのではなく
// 「childHint=1」というURLパラメータ経由で、入力欄の外側に案内文として表示するよう
// 変更された（app/ask/page.tsx参照）。これにより新規の相談にはもうこのプレースホルダー
// 文言は含まれなくなったが、変更前に投稿された既存の相談データには引き続き残っている
// ため、ここでの除去処理は既存データのtitle・description生成にはまだ意味がある。
//
// 注意：学校名を含む冒頭の一文（「「◯◯学校」がうちの子に合うかどうか知りたいです。」）
// 自体は、検索されやすいキーワード（学校名）を含む価値のある部分なので取り除かない。
// 取り除くのは、内容の無いプレースホルダー文言のみ。

const CHILD_TRAITS_PLACEHOLDER =
  '子どもの特徴：（性格・好き嫌い・困りごとなど、思いつくまま書いてください）';

// generateMetadata（title・description生成）専用。中身の無いプレースホルダー文言だけを
// 取り除き、学校名を含む冒頭の一文＋保護者が実際に書き足した部分を残す。
export function stripSchoolAskBoilerplate(question: string): string {
  const withoutPlaceholder = question.split(CHILD_TRAITS_PLACEHOLDER).join(' ');
  const trimmed = withoutPlaceholder.replace(/\s+/g, ' ').trim();
  return trimmed || question;
}
