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
  // 生活リズム・昼夜逆転・ゲーム/スマホの使い方など、学校や対人関係以外の日常生活面の
  // 相談用に追加（2026-10-13）。専用アイコン未用意のため、暫定でicon_book.pngを流用。
  daily: { label: '日常生活のこと', short: '日常生活', cls: 'cat-daily', icon: '/assets/icon_book.png' },
  other: { label: 'その他', short: 'その他', cls: 'cat-other', icon: '/assets/icon_book.png' },
};

export type Category = keyof typeof CATS;

// カテゴリごとの入力例。/ask の入力欄プレースホルダーと、自動投稿（app/api/cron/auto-post）の
// 文体参照の両方から使う共通データのため、ここに集約した（2026-10-14、自動投稿機能の追加時に
// app/ask/page.tsxから移動）。
export const CATEGORY_EXAMPLES: Record<Category, string> = {
  body: '例：ここ2週間、毎朝「お腹痛い」と言って学校に行きたがりません…',
  social: '例：クラスの友達との関係がうまくいかなくなってから、「学校に行きたくない」と言うようになりました…',
  school: '例：担任の先生と合わないようで、学校に行きたがらなくなりました…',
  will: '例：「もう学校には行かない」と、本人が自分の意思で言うようになりました…',
  approach: '例：登校を渋る子に、どこまで無理に行かせるべきか声のかけ方に悩んでいます…',
  course: '例：高校に行くかどうか本人も決めきれず、進路の話をするとふさぎこんでしまいます…',
  dev: '例：発達障害の診断を受けている子が、学校の環境に慣れず行きたがらなくなりました…',
  home: '例：子どもの不登校への対応方針が夫婦で合わず、家庭内でどう関わるか揉めています…',
  daily: '例：昼夜逆転してしまい、ゲームばかりで生活リズムが乱れています…',
  other: '例：子どもが不登校気味で、どう対応すればいいか分からず相談したいです…',
};
