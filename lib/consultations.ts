import { getSupabaseAdmin } from '@/lib/supabase';
import { Consultation } from '@/lib/types';
import { expertDisplayName, answerFirstLineSnippet } from '@/lib/expertDisplay';
import { SEARCH_TAG_CANDIDATES, buildThemeOrFilter } from '@/lib/searchTags';
import { CATS } from '@/lib/categories';
import { SENPAI_CREDENTIAL } from '@/lib/config';

// 検索語（q）をquestion/answerに対するPostgRESTの.or()フィルター文字列に変換する。
// getConsultationsList（一覧取得）とgetConsultationCounts（カテゴリ別件数）の両方で
// 同じ検索語の扱い（テーマ候補語ならTHEME_SYNONYMSまで含める）をするために共通化した
// （2026-11-01追加。以前はgetConsultationsListにだけ実装されていて、カテゴリ別件数
// （ホームのチップの件数表示）には検索語が反映されていなかった）。
function buildSearchOrFilter(q: string): string {
  const trimmedQ = q.trim();
  return SEARCH_TAG_CANDIDATES.includes(trimmedQ)
    ? buildThemeOrFilter(trimmedQ)
    : `question.ilike.%${trimmedQ}%,answer.ilike.%${trimmedQ}%`;
}

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
// ホーム画面の並び替え選択肢（2026-10-15追加）。「参考になった順」は
// LikeButton/ConsultationCardで表示している likes（「参考になった◯人」）と
// 同じ指標で、新たに別の集計を作るのではなく既存のlikesカラムをそのまま使う。
export type ConsultationSort = 'new' | 'views' | 'likes';

export async function getConsultationsList({
  category,
  q,
  viewerId,
  authorId,
  expertAnswered,
  expertId,
  memberActive = false,
  memberId,
  childId,
  limit = 50,
  sort = 'new',
}: {
  category?: string | null;
  q?: string | null;
  viewerId?: string | null;
  authorId?: string | null;
  expertAnswered?: boolean;
  // 専門家個別ページ（/experts/[id]）で「この専門家が回答した相談」だけに絞るための条件。
  // expertAnswered（専門家回答全体）とは別に、回答した専門家本人のidで絞り込む（2026-10-12追加）。
  expertId?: string | null;
  memberActive?: boolean;
  memberId?: string | null;
  // 子どもプロフィール（2026-10-16追加）：マイページで「この子の相談だけ見る」絞り込みに使う。
  childId?: string | null;
  limit?: number;
  sort?: ConsultationSort;
}): Promise<Consultation[]> {
  const supabase = getSupabaseAdmin();

  // consultationsからexpertsへの参照はexpert_id（回答した専門家）とrequested_expert_id
  // （指名した専門家）の2つあるため、experts!expert_id と明示しないと「どちらの参照か」が
  // あいまいでPostgRESTがエラーを返す（結果、一覧が全件取得できなくなる）。
  let query = supabase
    .from('consultations')
    .select('*, experts!expert_id(id, name, display_name, credential, experienced_school_names, online_consult_url, photo_url, bio)')
    .eq('hidden', false)
    // AIの回答に対する「その場での返信（ラリー）」として作られた続きの相談（parent_idあり）は、
    // 他の人向けの一覧・検索には出さない（文脈がないと意味が分からない断片になる、
    // テーマ別件数が実質的な新規相談でないものまで膨らむ、等の理由。2026-10-16追加）。
    // 元の相談の詳細ページでだけ、別途まとめて表示する。
    .is('parent_id', null);

  // 希死念慮・自傷等の安全上書きが発動した相談は、一般公開の一覧・検索（ホーム・テーマ別・
  // キーワード検索・専門家ページの「回答した相談」等）からは除外する。本人の相談履歴
  // （authorId指定＝マイページ）では、本人が自分の過去の相談を見返せるよう従来どおり表示する
  // （2026-10-31、決済代行会社の審査でセンシティブな内容が公開一覧に出ていた可能性を踏まえた対応。
  // 元々「よく読まれている」ランキングからのみ除外していたが、一覧自体からも外すことにした）。
  if (!authorId) {
    query = query.or('crisis_detected.is.null,crisis_detected.eq.false');
  }

  query = query.limit(limit);

  // 主な並び替え軸（新着・閲覧数・参考になった数）を指定したうえで、
  // 同値が並んだ時の順序が安定するよう常にcreated_at descを副軸として追加する。
  if (sort === 'views') {
    query = query.order('views', { ascending: false }).order('created_at', { ascending: false });
  } else if (sort === 'likes') {
    query = query.order('likes', { ascending: false }).order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }
  if (q && q.trim()) {
    // qが「気になるテーマから探す」のタグ候補語そのものと一致する場合は、
    // そのテーマの同義語（lib/searchTags.ts THEME_SYNONYMS）も含めて検索する。
    // タグ一覧（/api/consultations/tag-counts）側の件数も同じ語で数えているため、
    // タグをタップしたときの検索結果件数と表示件数が一致する（2026-10-16追加）。
    query = query.or(buildSearchOrFilter(q));
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
  if (expertId) {
    query = query.eq('expert_id', expertId);
  }
  if (childId) {
    query = query.eq('child_id', childId);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  // expertAnswered（「専門家が回答した相談」の一覧・個別専門家ページ）は、
  // ブランディング上「専門家」専用の区画のため、先輩保護者（経験者）の回答は
  // 含めない（2026-11-01、専門家への質問の価格体系統一に伴い専門家・先輩保護者を
  // 区別する条件を一通り撤去した際、ここだけ元々区別する条件が無かったことが
  // 判明。「https://futoko-dosuru.com/expertlist 保護者の解答載ってるね」との
  // 指摘を受けて追加）。
  const filtered = expertAnswered ? data.filter((item) => item.experts?.credential !== SENPAI_CREDENTIAL) : data;

  return filtered.map((item) => {
    // 専門家の本名（experts.name）は本人確認用のため、相談者には表示名のみを渡す
    // （2026-10-13、本名と表示名を分離）。
    const experts = item.experts
      ? {
          // プロフィールページへのリンク・「直接相談をリクエスト」ボタン用
          // （2026-11-01、クライアント側の再取得（/api/consultations）でこのidが
          // 欠けていたため、初回表示後にプロフィールリンクが消える不具合があった。
          // app/result/[id]/page.tsxのgetConsultationと同じ項目を揃えた）。
          id: item.experts.id,
          name: expertDisplayName(item.experts),
          credential: item.experts.credential,
          experienced_school_names: item.experts.experienced_school_names || [],
          online_consult_url: item.experts.online_consult_url || null,
          photo_url: item.experts.photo_url || null,
          bio: item.experts.bio || null,
        }
      : null;
    const base = { ...item, experts };
    const isExpertAnswered = item.request_type === 'expert' && item.expert_status === 'answered';
    const isOwner = viewerId && item.author_id === viewerId;
    if (isExpertAnswered && !isOwner && !memberActive) {
      // 本文は見せないが、「続きが気になる」導線として最初の1行だけはそのまま見せる
      // （2026-10-31、「ボカシは最初の1行だけみせるのどう？」との提案を受けて追加）。
      // 2026-11-01、専門家への質問をAI回答つきの相談に統合したのに伴い、answer列は
      // 常にAIの回答を保持する（ロックの対象はexpert_answerだけ）。以前はここでanswerも
      // ''にしていたが、それだと専門家回答待ちの相談のAI回答までロック扱いで消えて
      // しまっていた。
      const snippet = item.expert_answer ? answerFirstLineSnippet(item.expert_answer) : null;
      return { ...base, expert_answer: null, expert_answer_snippet: snippet, locked: true };
    }
    return { ...base, locked: false };
  }) as Consultation[];
}

// カテゴリ別の件数（ホーム画面のチップ「身体面（19）」等）を取得する。
// app/page.tsxのgetCounts（'use cache'でサイト全体の件数をキャッシュする版）とは別に、
// こちらはクライアント側（HomeClient）から検索語（q）付きで呼べるようにしたもの
// （2026-11-01追加。「タグ選定してるのに全部でてくる」との指摘を受けて調査したところ、
// 一覧本体だけでなくチップの件数も検索語に関係なく常にサイト全体の件数のままだった
// ため、検索中であってもその検索語に絞り込んだ件数を表示できるようにした）。
// getConsultationsListと同じベースのフィルター（hidden・parent_id・crisis除外）を
// そろえたうえで、qが指定されていればそれも反映する。
export async function getConsultationCounts({
  q,
}: {
  q?: string | null;
} = {}): Promise<{ counts: Record<string, number>; total: number }> {
  const supabase = getSupabaseAdmin();
  const categoryKeys = Object.keys(CATS);

  const buildBaseQuery = () => {
    let query = supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .eq('hidden', false)
      .is('parent_id', null)
      .or('crisis_detected.is.null,crisis_detected.eq.false');
    if (q && q.trim()) {
      query = query.or(buildSearchOrFilter(q));
    }
    return query;
  };

  const [totalResult, ...categoryResults] = await Promise.all([
    buildBaseQuery(),
    ...categoryKeys.map((key) => buildBaseQuery().eq('category', key)),
  ]);

  const counts: Record<string, number> = {};
  categoryKeys.forEach((key, i) => {
    counts[key] = categoryResults[i].count || 0;
  });

  return { counts, total: totalResult.count || 0 };
}
