import { SENPAI_CREDENTIAL } from './config';

// 専門家の「本名」（name、本人確認用。運営のみが参照）と「表示名」（display_name、
// 相談者に公開される名前）を分離している（2026-10-13追加）。表示名が未設定の場合は
// 本名をそのまま公開表示に使う。本人確認・支払いなど運営向けの処理では、この関数を使わず
// 常に name（本名）をそのまま使うこと。
export function expertDisplayName(expert: { name: string; display_name?: string | null }): string {
  return (expert.display_name && expert.display_name.trim()) || expert.name;
}

// 専門家（公認心理師など）か先輩保護者（経験者）かで、回答欄の見出し文言を
// 出し分ける（2026-10-31、「専門家の回答ではなく、先輩保護者の回答みたいな
// 書き方がいい」との指摘を受けて追加）。本人確認が完了する前（locked状態）でも
// credentialの情報自体は既に渡せるため、ロック中のラベルにもそのまま使う。
export function answerSectionLabel(credential: string | null | undefined): string {
  return credential === SENPAI_CREDENTIAL ? '先輩保護者の回答' : '専門家の回答';
}
