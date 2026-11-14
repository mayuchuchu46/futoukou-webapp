// 「みんなのご褒美」（/gohoubi/voices）投稿専用の定型リアクション
// （2026-11-14追加）。lib/reactions.ts（consultations向け、共感・連帯用の
// empathy/same/cheer）とは目的が異なり、こちらは「この投稿者を褒める」ための
// スタンプなので、別の語彙として分ける。
export type GohoubiReactionType = 'erai' | 'sugoi' | 'otsukare';

export const GOHOUBI_REACTION_TYPES: { key: GohoubiReactionType; emoji: string; label: string }[] = [
  { key: 'erai', emoji: '🎉', label: 'えらい' },
  { key: 'sugoi', emoji: '👏', label: 'すごい' },
  { key: 'otsukare', emoji: '💪', label: 'お疲れ' },
];
