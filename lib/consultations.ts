import { getSupabaseAdmin } from '@/lib/supabase';
import { Consultation } from '@/lib/types';

// 相談一覧の取得＋ロック判定（API route とホーム画面のSSRで共通利用）。
// 専門家の回答は、本人（投稿者）か、読み放題会員（memberActive）にだけ見せる。
// それ以外には回答本文を伏せ、locked フラグだけ立てて返す（一覧でのぼかし表示用）。
//
// memberActive / memberId は呼び出し側が判定して渡す（このファイル自体はCookieを読まない）。
// サーバーコンポーネントからの直接呼び出し（app/page.tsx・app/result/[id]/page.tsx）は
// Suspense配下でないままCookieベースの会員判定を行うと、CDNの共有キャッシュに
// 特定ユーザー向けの表示が乗ってしまう危険があるため、そこでは常に匿名（false / null）扱いにし、
// 実際の会員判定はクライアント側からの再取得（/api/consultations）でのみ行う。
//
// マイページ（会員）での履歴表示：ログイン中の会員は、今のブラウザのauthor_id（匿名uid）
// だけでなく、member_id が紐づいた相談（別の端末・ブラウザで投稿したものを含む）も
// まとめて見られるようにするため、authorId と memberId が両方あるときは
// author_id.eq.X OR member_id.eq.Y で取得する。
export async function getConsultationsList({
  category,
  q,
  viewerId,
  authorId,
  expertAnswered,
  memberActive = false,
  memberId,
  limit = 50,
}: {
  category?: string | null;
  q?: string | null;
  viewerId?: string | null;
  authorId?: string | null;
  expertAnswered?: boolean;
  memberActive?: boolean;
  memberId?: string | null;
  limit?: number;
}): Promise<Consultation[]> {
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('consultations')
    .select('*, experts(name, credential)')
    .eq('hidden', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }
  if (q && q.trim()) {
    query = query.or(`question.ilike.%${q.trim()}%,answer.ilike.%${q.trim()}%`);
  }
  // memberIdによる絞り込みは、呼び出し側が明示的に「自分（author_id）の相談を見せてほしい」と
  // 言っている時（authorIdが渡されている時）だけ行う。authorIdが無い一般の一覧取得（ホーム画面の
  // 全件表示やカテゴリ・キーワード検索など）では、たまたまログイン中の会員であっても
  // member_idで絞り込んではいけない（絞り込むと、その会員がまだ投稿していない分だけ一覧が
  // 空になってしまう）。
  if (authorId) {
    // author_id はクライアント（localStorageのdsk_uid）から渡される値なので、
    // .or() に生文字列として埋め込む前に形式を検証する（PostgRESTのフィルタ構文
    // インジェクション対策）。getUid() が作る値は "u_" + 英数字のみ。
    // 検証に通らない場合は memberId 側の条件のみ使う（通常の .eq() はライブラリ側で
    // パラメータ化されるため、そちらは単独では危険ではない）。
    const safeAuthorId = /^[A-Za-z0-9_-]{1,128}$/.test(authorId) ? authorId : null;
    if (memberId && safeAuthorId) {
      query = query.or(`author_id.eq.${safeAuthorId},member_id.eq.${memberId}`);
    } else if (memberId && !safeAuthorId) {
      query = query.eq('member_id', memberId);
    } else {
      query = query.eq('author_id', authorId);
    }
  }
  if (expertAnswered) {
    query = query.eq('request_type', 'expert').eq('expert_status', 'answered');
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((item) => {
    const isExpertAnswered = item.request_type === 'expert' && item.expert_status === 'answered';
    const isOwner = viewerId && item.author_id === viewerId;
    if (isExpertAnswered && !isOwner && !memberActive) {
      return { ...item, answer: '', expert_answer: null, locked: true };
    }
    return { ...item, locked: false };
  }) as Consultation[];
}
