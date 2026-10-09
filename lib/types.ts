export type Consultation = {
  id: string;
  category: 'body' | 'social' | 'will' | 'other';
  question: string;
  answer: string;
  author_id: string;
  likes: number;
  liked_by: string[];
  comment_count: number;
  created_at: string;
};

export type Comment = {
  id: string;
  consultation_id: string;
  author_id: string;
  body: string;
  created_at: string;
};
