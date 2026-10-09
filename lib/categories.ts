export const CATS: Record<string, { label: string; cls: string; icon: string }> = {
  body: { label: '身体的要因', cls: 'cat-body', icon: '/assets/icon_heart.png' },
  social: { label: '対人関係', cls: 'cat-social', icon: '/assets/icon_comment.png' },
  will: { label: '本人の意思', cls: 'cat-will', icon: '/assets/icon_cap.png' },
  other: { label: 'その他', cls: 'cat-other', icon: '/assets/icon_book.png' },
};

export type Category = keyof typeof CATS;
