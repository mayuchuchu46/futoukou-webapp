// 「学びの多様化学校」（旧：不登校特例校）としての開校を自治体が公表しているが、
// 文部科学省の正式な指定（MANABI_TAYOUKA_GAKKO、全国84校）はまだ確認できていない
// 学校の一覧（2026-11-05追加）。
//
// 【掲載方針】
// - MANABI_TAYOUKA_GAKKOとは完全に別の配列として管理する。文科省の指定校一覧を
//   前提にしている既存の仕組み（/gakkoページの「全国◯◯校」という件数表示、
//   AIの学校提案（lib/prompt.ts）、学校診断（lib/shindanItems.ts）、school-fit判定
//   （lib/schoolFit.ts）、似ている学校の提案（lib/similarSchools.ts）等）には
//   一切混ぜない。開校前でまだ転入学できない学校を、既存の指定校と同列の「候補」
//   として扱ってしまうのを防ぐため。
// - 表示先は/gakkoページ（gakkoタブ）の専用セクションのみに限定する。
//   /gakko/school/[no]のような個別の学校紹介ページは作らない（開校前で、入学・
//   転入学の条件等がまだ確定情報として出せないため）。
// - 自治体の公式発表・信頼できる報道機関で確認できた事実のみを記載する
//   （推測で開校日や特色を埋めない）。
// - 文部科学省の指定が正式に確認できたら、manabiTayoukaGakko.ts側の
//   MANABI_TAYOUKA_GAKKOに正式なレコードとして追加し、この配列からは削除する。
export type PlannedManabiTayoukaGakko = {
  id: string; // 一意なスラッグ
  name: string;
  prefecture: string;
  city: string;
  /** 学校種：小学校・中学校・高等学校・小・中 */
  schoolType: string;
  publicPrivate: string;
  /** 確認できた開校予定時期（例："2027年4月予定"）。確定でない場合もそのまま書く */
  plannedOpening: string;
  /** 確認できた固有の補足情報（無ければnull） */
  note: string | null;
  sourceName: string;
  sourceUrl: string;
  /** 当サイトへの掲載日（YYYY-MM-DD） */
  addedAt: string;
};

export const PLANNED_MANABI_TAYOUKA_GAKKO: PlannedManabiTayoukaGakko[] = [
  {
    id: 'akita-miraigakuen',
    name: '秋田市立みらい学園小学校・中学校',
    prefecture: '秋田県',
    city: '秋田市',
    schoolType: '小・中',
    publicPrivate: '公立',
    plannedOpening: '2027年4月予定',
    note:
      '旧下北手小学校の校舎を改修して使用する予定です。一人ひとりの強み・弱みに取り組む時間「エンパワータイム」を設けるなど、柔軟な時間割と個別支援を特色としています。秋田県内では私立の秋田修英高等学校に続く2校目で、公立校としては県内初です。',
    sourceName: '秋田魁新報',
    sourceUrl: 'https://www.sakigake.jp/news/article/20261030AK0004/',
    addedAt: '2026-11-05',
  },
];
