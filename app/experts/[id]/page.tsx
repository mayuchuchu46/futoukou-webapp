import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import ConsultationCard from '@/components/ConsultationCard';
import ExpertAvatar from '@/components/ExpertAvatar';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getConsultationsList } from '@/lib/consultations';
import { expertDisplayName } from '@/lib/expertDisplay';

// 専門家一覧（/experts）は専門家全員をまとめて表示するだけで、「この専門家が
// 今までどう回答してきたか」を見られる個別ページが無かったため追加（2026-10-12、
// 「この人の回答みたいな（ページ）」という要望を受けて）。
// データベースの最新状態を毎回サーバー側で取得するページなので、ビルド時の
// 静的化はせず、リクエストごとに生成する。
export const instant = false;

type ExpertProfile = {
  id: string;
  name: string;
  credential: string;
  bio: string;
  photo_url: string | null;
  link_url: string | null;
  verified: boolean;
};

async function getVerifiedExpert(id: string): Promise<ExpertProfile | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('experts')
    .select('id, name, display_name, credential, bio, photo_url, link_url, verified')
    .eq('id', id)
    .eq('verified', true)
    .single();
  // 本名（name）は本人確認用のため、公開ページに渡す前に表示名へ置き換える
  // （2026-10-13、本名と表示名を分離）。
  return data ? { ...data, name: expertDisplayName(data) } : null;
}

// linkUrlは専門家本人の入力値なので、http(s)で始まる値のみリンクとして表示する
// （javascript: などの危険なスキームをそのまま出さないための簡易チェック。/experts/page.tsxと同じ）。
function safeHttpUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}

export default async function ExpertProfilePublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const expert = await getVerifiedExpert(id);

  // 本人確認が完了していない・存在しないidは、一覧ページにまだ出ていない
  // 専門家の内部情報を推測されないよう、通常の404として扱う。
  if (!expert) {
    notFound();
  }

  // このページはログイン状態に関わらず誰が見ても同じ内容（匿名扱い）。本人・会員向けの
  // ロック解除は一覧カード側では行わず、一覧ページ（/expertlist）や詳細ページ
  // （/result/[id]）に遷移してから会員判定される（lib/consultations.tsのコメント参照）。
  const answeredItems = await getConsultationsList({ expertId: expert.id, expertAnswered: true, limit: 30 });

  const link = safeHttpUrl(expert.link_url);

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <Link href="/experts" className="backlink" style={{ margin: '14px 0' }}>← もどる</Link>

          <div className="card" style={{ gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
              <ExpertAvatar photoUrl={expert.photo_url} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{expert.credential}・{expert.name}</div>
                {expert.bio && (
                  <div className="qtext" style={{ whiteSpace: 'pre-wrap' }}>
                    {expert.bio}
                  </div>
                )}
                {link && (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="backlink"
                    style={{ fontSize: 13, margin: 0 }}
                  >
                    ご本人のサービス・サイトはこちら →
                  </a>
                )}
              </div>
            </div>
            <Link href={`/ask?expert=${expert.id}`} className="btn-secondary" style={{ alignSelf: 'flex-start' }}>
              この専門家に相談する
            </Link>
          </div>

          <div className="muted" style={{ margin: '14px 0 6px', fontWeight: 700 }}>
            {expert.name}さんの回答（{answeredItems.length}件）
          </div>
          {answeredItems.length === 0 ? (
            <div className="empty">まだこの専門家が回答した相談がありません。</div>
          ) : (
            answeredItems.map((item) => <ConsultationCard key={item.id} item={item} />)
          )}
        </div>
        <PcSidebar hideExperts />
      </div>
      <BottomNav />
    </div>
  );
}
