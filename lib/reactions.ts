// 相談詳細ページ用の「定型リアクション」。自由記述のコメント欄は、不登校・希死念慮
// といった繊細なテーマを扱うサービスで今の運営体制（モニタリング要員が実質いない）
// だと荒れた時のリスクが大きいため見送り、代わりに定型文をタップするだけの軽い
// リアクションにした（2026-10-16、「ユーザーもコメントできたらの機能つけるのどう
// おもう？」との相談を受けて）。
// 既存の「参考になった」（lib/types.tsのlikes/liked_by、回答の有用性の評価）とは
// 役割を分け、こちらは「自分も同じ」という共感・連帯のための軽いリアクションにする。
export type ReactionType = 'empathy' | 'same' | 'cheer';

export const REACTION_TYPES: { key: ReactionType; emoji: string; label: string }[] = [
  { key: 'empathy', emoji: '🥺', label: 'わかります' },
  { key: 'same', emoji: '🙋', label: 'うちも同じです' },
  { key: 'cheer', emoji: '📣', label: '応援しています' },
];
