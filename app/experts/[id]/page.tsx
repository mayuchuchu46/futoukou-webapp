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
import { SENPAI_CREDENTIAL } from '@/lib/config';
import type { CareerField } from '@/lib/careerFields';

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
  online_consult_url: string | null;
  verified: boolean;
  career_fields: CareerField[] | null;
  other_credentials: string[] | null;
};

async function getVerifiedExpert(id: string): Promise<ExpertProfile | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('experts')
    .select('id, name, display_name, credential, bio, photo_url, link_url, online_consult_url, verified, career_fields, other_credentials')
    .eq('id', id)
    .eq('verified', true)
    // 経験者はこの専門家向け個別ページの対象外（2026-10-31追加）。
    .neq('credential', SENPAI_CREDENTIAL)
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
  // オンライン通話・チャットリレーの予約・決済は自前で作らず、専門家本人が用意した
  // 外部サービス（MOSH等）のページへリンクするだけにする（2026-11-01追加。顔出し・
  // 顔出しなし・チャットのみの選択は当日その予約先の通話内で行うため、ここでは
  // モードを分けず1つのリンクのみ用意する）。
  const onlineConsultLink = safeHttpUrl(expert.online_consult_url);

  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <Link href="/experts" className="backlink" style={{ margin: '14px 0' }}>← もどる</Link>

          <div className="card" style={{ gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
              <ExpertAvatar photoUrl={expert.photo_url} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{expert.credential}・{expert.name}</div>
                {/* 保有資格（その他・複数可、2026-11-03追加）。主な資格（上の肩書き）
                    以外に兼任している資格があれば併記する。 */}
                {!!expert.other_credentials?.length && (
                  <div className="muted" style={{ fontSize: 13 }}>
                    保有資格：{expert.other_credentials.join('、')}
                  </div>
                )}
                {expert.bio && (
                  <div className="qtext" style={{ whiteSpace: 'pre-wrap' }}>
                    {expert.bio}
                  </div>
                )}
                {/* 経歴確認（2026-11-03追加）。本人の自己申告（運営による裏付け確認は
                    行わない）の実務分野・年数をそのまま経歴として表示する。 */}
                {!!expert.career_fields?.length && (
                  <div className="muted" style={{ fontSize: 13 }}>
                    経歴：
                    {expert.career_fields
                      .map((c) => (c.years ? `${c.field}（${c.years}年）` : c.field))
                      .join('、')}
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
                    ご本人のサイト・SNSはこちら →
                  </a>
                )}
              </div>
            </div>
            {/* 2026-11-01、指名機能を撤去したため、ここから送った質問が必ずこの専門家に
                届く・回答される保証はない（登録している専門家・経験者が任意で拾って
                回答するボランティアの仕組みのため）。誤解されないよう一言添える。 */}
            <div className="muted" style={{ fontSize: 12 }}>
              質問はどうする先生に送られ、登録している専門家・経験者が任意で回答します（この方が必ず回答するとは限りません）。
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <Link href={'/ask'} className="btn-secondary" style={{ alignSelf: 'flex-start' }}>
                どうする先生で質問する
              </Link>
              {onlineConsultLink && (
                <a
                  href={onlineConsultLink}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="btn-primary"
                  style={{ alignSelf: 'flex-start' }}
                >
                  直接相談してみる →
                </a>
              )}
            </div>
            {onlineConsultLink && (
              <div className="muted" style={{ fontSize: 12 }}>
                ご本人が設定したページへ移動します（内容・料金はご本人の設定によります）。顔出し・顔出しなし・チャットのみは、通話開始後にその場で選べます。
              </div>
            )}
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
