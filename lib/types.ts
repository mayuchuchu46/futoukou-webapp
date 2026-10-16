export type Consultation = {
  id: string;
  category: 'body' | 'social' | 'school' | 'will' | 'approach' | 'course' | 'dev' | 'home' | 'other';
  question: string;
  answer: string;
  grade: string | null;
  gender: string | null;
  author_id: string;
  member_id?: string | null;
  likes: number;
  liked_by: string[];
  // 定型リアクション（lib/reactions.ts参照）。タイプごとの件数・反応済みuid一覧を
  // それぞれjsonbの1列にまとめて持つ（2026-10-16追加）。likes/liked_byと同じ
  // 「カード側で見せる軽い反応」の仕組みだが、タイプが複数あるためjsonbにした。
  reactions?: Partial<Record<string, number>>;
  reacted_by?: Partial<Record<string, string[]>>;
  views: number;
  reports?: number;
  reported_by?: string[];
  created_at: string;
  request_type: 'ai' | 'expert';
  price_jpy: number | null;
  paid: boolean;
  expert_id: string | null;
  requested_expert_id?: string | null;
  expert_status: 'pending' | 'answered' | null;
  expert_answer: string | null;
  refunded: boolean;
  expert_answer_helpful?: boolean | null;
  experts?: { name: string; credential: string } | null;
  locked?: boolean;
  // 希死念慮・自傷等を検知した安全上書き回答（ホットライン案内のみ）かどうか（2026-10-14追加）。
  crisis_detected?: boolean;
  // この相談が、別の相談（AIの回答）に対する「その場での返信（ラリー）」として
  // 作られたものかどうか。nullなら新規の相談、値があればその相談の続き（2026-10-16追加）。
  // 続きは一覧・テーマ件数には出さず、元の相談の詳細ページの中でだけ表示する。
  parent_id?: string | null;
  // どの子どもについての相談か（任意、2026-10-16追加）。ログイン中の会員が
  // 子どもプロフィール（lib/types.ts Childを参照）を作っている場合に選べる。
  child_id?: string | null;
};

// 子どもプロフィール（2026-10-16追加）。「兄弟で不登校のパターンが多い」ため、
// 1つの会員アカウントで複数の子どもを分けて管理できるようにする機能。
export type Child = {
  id: string;
  name: string;
  grade: string | null;
  gender: string | null;
  created_at: string;
};

export const GRADE_OPTIONS = ['小学1年生','小学2年生','小学3年生','小学4年生','小学5年生','小学6年生','中学1年生','中学2年生','中学3年生','高校1年生','高校2年生','高校3年生','その他'];
export const GENDER_OPTIONS = ['男の子', '女の子', '回答しない'];

export function metaLabel(item: { grade?: string | null; gender?: string | null }) {
  const parts: string[] = [];
  if (item.grade) parts.push(item.grade);
  if (item.gender && item.gender !== '回答しない') parts.push(item.gender);
  return parts.length ? parts.join('・') + 'の保護者' : '';
}
