// 「みんなのデータ」機能（2026-10-16追加）。「気づいたときにメモしておく」という
// AIの回答でよく出るアドバイスを、実際にサービス内でできるようにしたもの。自由記述の
// メモだと個人情報混入のリスクや、みんなで集計してグラフにする難しさがあるため、
// 選択式の日替わりアンケートにした。質問は曜日や個人設定に関わらず、JSTの「今日」の
// 日付から全員同じものが決まる（DBに質問テーブルを持たず、コード側の配列だけで管理）。
// 集計を「その日の回答だけ」ではなく同じ質問の累計にしたのに合わせて（2026-10-17）、
// 質問文自体も「今日、〜しましたか？」という単発の聞き方ではなく「最近、〜していますか？」
// という聞き方に統一した。日替わりで出す質問そのもの（どの質問を今日表示するか）は
// 従来通りJSTの日付で決まるローテーションのまま変えていない。

export type QuestionChoice = { value: string; label: string };

export type DailyQuestion = {
  slug: string;
  text: string;
  choices: QuestionChoice[];
};

// 質問バンク。増やす・文言を変えるのはこの配列を直接編集すればよい（DBマイグレーション
// 不要）。選択肢は、棒グラフでの集計のしやすさを考えて4〜5択程度に収めている。
export const DAILY_QUESTIONS: DailyQuestion[] = [
  {
    slug: 'wake_time',
    text: '最近、お子さんは何時ごろ起きていますか？',
    choices: [
      { value: 'before7', label: '7時より前' },
      { value: '7to9', label: '7〜9時' },
      { value: '9to11', label: '9〜11時' },
      { value: '11to13', label: '11〜13時' },
      { value: 'after13', label: '13時より後' },
    ],
  },
  {
    slug: 'breakfast',
    text: '最近の朝ごはんは？',
    choices: [
      { value: 'full', label: 'しっかり食べた' },
      { value: 'little', label: '少し食べた' },
      { value: 'none', label: '食べなかった' },
    ],
  },
  {
    slug: 'went_outside',
    text: '最近、お子さんは家から一歩でも外に出ていますか？',
    choices: [
      { value: 'yes', label: '出た' },
      { value: 'no', label: '出なかった' },
    ],
  },
  {
    slug: 'talked_about_school',
    text: '最近、学校や将来のことについて話をしていますか？',
    choices: [
      { value: 'yes', label: '話した' },
      { value: 'a_little', label: '少しだけ話した' },
      { value: 'no', label: '話さなかった' },
    ],
  },
  {
    slug: 'screen_time',
    text: '最近のスマホ・ゲームの時間は、少し前と比べて？',
    choices: [
      { value: 'more', label: 'いつもより多かった' },
      { value: 'same', label: 'いつも通り' },
      { value: 'less', label: 'いつもより少なかった' },
    ],
  },
  {
    slug: 'mood',
    text: '最近のお子さんの様子に近いものは？',
    choices: [
      { value: 'calm', label: '穏やかだった' },
      { value: 'irritable', label: 'イライラしていた' },
      { value: 'down', label: '落ち込んでいた' },
      { value: 'usual', label: 'いつも通り' },
    ],
  },
  {
    slug: 'bed_time',
    text: '最近は何時ごろ寝ていますか？',
    choices: [
      { value: 'before22', label: '22時より前' },
      { value: '22to0', label: '22〜0時' },
      { value: '0to2', label: '0〜2時' },
      { value: 'after2', label: '2時より後' },
      { value: 'unknown', label: '分からない' },
    ],
  },
  {
    slug: 'got_dressed',
    text: '最近、お子さんはパジャマから着替えていますか？',
    choices: [
      { value: 'yes', label: '着替えた' },
      { value: 'no', label: '着替えなかった' },
      { value: 'unknown', label: '分からない' },
    ],
  },
  {
    slug: 'friend_contact',
    text: '最近、お子さんは友達と連絡を取ったり遊んだりしていますか（オンライン含む）？',
    choices: [
      { value: 'yes', label: 'あった' },
      { value: 'no', label: 'なかった' },
      { value: 'unknown', label: '分からない' },
    ],
  },
  {
    slug: 'enjoyed_something',
    text: '最近、お子さんが好きなこと・楽しいことをしている時間はありますか？',
    choices: [
      { value: 'yes', label: 'あった' },
      { value: 'no', label: 'なかった' },
    ],
  },
  {
    slug: 'physical_complaint',
    text: '最近、お子さんから体調についての訴え（頭痛・腹痛など）はありますか？',
    choices: [
      { value: 'yes', label: 'あった' },
      { value: 'no', label: 'なかった' },
    ],
  },
  {
    slug: 'family_meal',
    text: '最近、家族そろって食事をする時間はありますか？',
    choices: [
      { value: 'yes', label: 'あった' },
      { value: 'no', label: 'なかった' },
    ],
  },
  {
    slug: 'helped_chores',
    text: '最近、お子さんは家のことを何か手伝っていますか？',
    choices: [
      { value: 'yes', label: '手伝った' },
      { value: 'no', label: '手伝わなかった' },
    ],
  },
  {
    slug: 'laughed',
    text: '最近、お子さんが笑う・楽しそうにする場面はありますか？',
    choices: [
      { value: 'yes', label: 'あった' },
      { value: 'no', label: 'なかった' },
      { value: 'unknown', label: '分からない' },
    ],
  },
  {
    slug: 'new_interest',
    text: '最近、お子さんが何か新しいことに興味を示していますか？',
    choices: [
      { value: 'yes', label: 'あった' },
      { value: 'no', label: 'なかった' },
    ],
  },
  {
    slug: 'routine_change',
    text: '最近のお子さんの一日の過ごし方は、いつも通りですか？',
    choices: [
      { value: 'usual', label: 'いつも通り' },
      { value: 'a_little', label: '少し違った' },
      { value: 'very', label: 'かなり違った' },
    ],
  },
  {
    slug: 'parent_condition',
    text: 'あなた自身は最近、どちらかというと？',
    choices: [
      { value: 'calm', label: '落ち着いていた' },
      { value: 'mixed', label: '半々くらいだった' },
      { value: 'stressed', label: '余裕がなかった' },
    ],
  },
  {
    slug: 'parent_talked_to_someone',
    text: 'あなたは最近、この状況について誰かに話していますか（家族・友人・相談窓口など）？',
    choices: [
      { value: 'yes', label: '話した' },
      { value: 'no', label: '話さなかった' },
    ],
  },
  {
    slug: 'parent_hope_moment',
    text: '最近、少しでも「大丈夫かも」と思える瞬間はありますか？',
    choices: [
      { value: 'yes', label: 'あった' },
      { value: 'no', label: 'なかった' },
    ],
  },
];

// JSTでの「今日」をYYYY-MM-DD文字列で返す（Vercelのサーバー自体はUTC動作のため、
// 単純に new Date() の日付を使うと日本時間の日付とズレることがある）。
export function todayJstDateString(): string {
  // en-CA ロケールはYYYY-MM-DD形式を返すため、そのまま日付文字列として使える。
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Tokyo' });
}

// JSTの通算日数（year*366+dayOfYear相当の単純な値でよく、厳密な連番でなくても
// 「日によって一意に決まり、毎日1ずつ進む」ことだけ満たせればローテーションとして機能する）
// をもとに、今日出す質問を1つ決める。
function jstDayIndex(dateStr: string): number {
  // dateStrは 'YYYY-MM-DD'。UTC固定でDateを作ることで、環境によるタイムゾーンのズレを防ぐ。
  const ms = new Date(`${dateStr}T00:00:00Z`).getTime();
  return Math.floor(ms / 86400000);
}

export function getQuestionForDate(dateStr: string): DailyQuestion {
  const idx = jstDayIndex(dateStr) % DAILY_QUESTIONS.length;
  return DAILY_QUESTIONS[idx];
}

export function getTodaysQuestion(): { date: string; question: DailyQuestion } {
  const date = todayJstDateString();
  return { date, question: getQuestionForDate(date) };
}

export function findQuestionBySlug(slug: string): DailyQuestion | undefined {
  return DAILY_QUESTIONS.find((q) => q.slug === slug);
}
