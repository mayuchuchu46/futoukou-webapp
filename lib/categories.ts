// 2026-10-10: body/social/school/will/approach/course/dev/home/other の9分類に変更
// （school, dev, home を新規追加。social は「対人関係」から「友人関係」に改名）。
// school（学校との関係）は友人関係（social）とは別テーマとして分離した。
// dev（発達のこと）は発達障害（ASD/ADHD/学習障害等）に関する相談用。
// home（家庭・自分のこと）は夫婦関係・親戚関係・保護者自身のことをまとめたカテゴリ。
// short はテーマ選択チップ（幅が限られる場所）専用の短縮表示。
// それ以外（質問投稿時のカテゴリ選択、カード上のバッジ等）は label（正式名称）を使う。
export const CATS: Record<string, { label: string; short: string; cls: string; icon: string }> = {
  body: { label: '身体的要因', short: '身体面', cls: 'cat-body', icon: '/assets/icon_heart.png' },
  social: { label: '友人関係', short: '友人関係', cls: 'cat-social', icon: '/assets/icon_comment.png' },
  // 専用アイコン未用意のため、暫定でicon_book.pngを流用（要差し替え）。Artifact側は絵文字🏫で代用中。
  school: { label: '学校との関係', short: '学校との関係', cls: 'cat-school', icon: '/assets/icon_book.png' },
  will: { label: '本人の意思', short: '本人の意思', cls: 'cat-will', icon: '/assets/icon_bird.png' },
  approach: { label: '関わり方', short: '関わり方', cls: 'cat-approach', icon: '/assets/icon_bell.png' },
  course: { label: '進路・勉強', short: '進路・勉強', cls: 'cat-course', icon: '/assets/icon_cap.png' },
  // 専用アイコン未用意のため、暫定でicon_book.pngを流用（要差し替え）。Artifact側は絵文字🧩で代用中。
  dev: { label: '発達のこと', short: '発達', cls: 'cat-dev', icon: '/assets/icon_book.png' },
  // 専用アイコン未用意のため、暫定でicon_book.pngを流用（要差し替え）。Artifact側は絵文字🏡で代用中。
  home: { label: '家庭・自分のこと', short: '家庭・自分', cls: 'cat-home', icon: '/assets/icon_book.png' },
  other: { label: 'その他', short: 'その他', cls: 'cat-other', icon: '/assets/icon_book.png' },
};

export type Category = keyof typeof CATS;
