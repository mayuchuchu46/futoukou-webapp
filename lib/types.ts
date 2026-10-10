export type Consultation = {
  id: string;
  category: 'body' | 'social' | 'school' | 'will' | 'approach' | 'course' | 'dev' | 'home' | 'other';
  question: string;
  answer: string;
  grade: string | null;
  gender: string | null;
  author_id: string;
  likes: number;
  liked_by: string[];
  views: number;
  created_at: string;
  request_type: 'ai' | 'expert';
  price_jpy: number | null;
  paid: boolean;
  expert_id: string | null;
  expert_status: 'pending' | 'answered' | null;
  expert_answer: string | null;
  refunded: boolean;
  experts?: { name: string; credential: string } | null;
  locked?: boolean;
};

export const GRADE_OPTIONS = ['小学1年生','小学2年生','小学3年生','小学4年生','小学5年生','小学6年生','中学1年生','中学2年生','中学3年生','高校1年生','高校2年生','高校3年生','その他'];
export const GENDER_OPTIONS = ['男の子', '女の子', '回答しない'];

export function metaLabel(item: { grade?: string | null; gender?: string | null }) {
  const parts: string[] = [];
  if (item.grade) parts.push(item.grade);
  if (item.gender && item.gender !== '回答しない') parts.push(item.gender);
  return parts.length ? parts.join('・') + 'の保護者' : '';
}
