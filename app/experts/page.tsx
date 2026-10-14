import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import ExpertAvatar from '@/components/ExpertAvatar';
import { getSupabaseAdmin } from '@/lib/supabase';
import { expertDisplayName } from '@/lib/expertDisplay';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { EXPERT_PRICE_JPY, MEMBERSHIP_PRICE_JPY } from '@/lib/config';

// データベースの最新状態（本人確認済みの専門家）を毎回サーバー側で取得するページなので、
// ビルド時の静的化はせず、リクエストごとに生成する。閲覧者ごとに表示が変わる情報は
// 含まない（誰が見ても同じ内容）ため、Cookieは読まずに済み、Suspenseで囲う必要もない。
export const instant = false;

// 検索結果でトップページと同じtitle/descriptionになっていたため、ページ固有の
// metadataを追加（2026-10-14、SEO対策の一環）。
export const metadata: Metadata = {
  title: `専門家一覧｜${SITE_NAME}`,
  description: '不登校の相談に対応する、本人確認済みの専門家（公認心理師など）の一覧です。',
  alternates: { canonical: `${SITE_URL}/experts` },
};

type ExpertProfile = {
  id: string;
  name: string;
  credential: string;
  bio: string;
  photo_url: string | null;
  link_url: string | null;
};

async function getVerifiedExperts(): Promise<ExpertProfile[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('experts')
    .select('id, name, display_name, credential, bio, photo_url, link_url')
    .eq('verified', true)
    .order('created_at', { ascending: true });
  // 本名（name）は本人確認用のため、公開ページに渡す前に表示名へ置き換える
  // （2026-10-13、本名と表示名を分離）。
  return (data || []).map((e) => ({ ...e, name: expertDisplayName(e) }));
}

// linkUrlは専門家本人の入力値なので、http(s)で始まる値のみリンクとして表示する
// （javascript: などの危険なスキームをそのまま出さないための簡易チェック）。
function safeHttpUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}

export default async function ExpertsPage() {
  const experts = await getVerifiedExperts();

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
        <Link href="/about" className="backlink" style={{ margin: '14px 0' }}>← もどる</Link>
        <h2 className="pagetitle">専門家一覧</h2>
        <div className="muted" style={{ marginBottom: 14 }}>
          有料の専門家相談でご回答いただく専門家です。公認心理師・臨床心理士など、運営が本人確認を行った方のみ掲載しています。
        </div>

        {/* 料金・利用の流れが以前はこのページのどこにも書かれておらず、一覧だけを見ても
            「そもそもいくらなのか」が分からない状態だったため追加（2026-10-14、
            「専門家一覧ページをもうちょっと整えてほしい」との要望を受けて）。
            lib/config.tsの実際の価格設定をそのまま参照しているので、値を変更した場合も
            自動的に反映される。 */}
        <div className="card" style={{ alignItems: 'flex-start', gap: 8, marginBottom: 14 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>料金・利用の流れ</div>
          <div className="qtext" style={{ fontSize: 13 }}>
            相談文を専門家本人が直接読み、文章で回答します。都度払いなら1回¥{EXPERT_PRICE_JPY.toLocaleString()}。月¥{MEMBERSHIP_PRICE_JPY.toLocaleString()}の読み放題会員なら、月1回無料で質問でき、他の方への専門家回答もすべて読めます。
          </div>
          <Link href="/ask" className="backlink" style={{ fontSize: 13, margin: 0 }}>
            相談するページへ →
          </Link>
        </div>

        {experts.length === 0 ? (
          <>
            <div className="empty">現在、本人確認が完了した専門家の登録がありません。準備が整い次第、ここに掲載されます。</div>
            <div className="muted" style={{ margin: '4px 0 2px', fontSize: 12 }}>掲載イメージ（サンプル）</div>
            <div
              className="card"
              style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start', opacity: 0.6 }}
            >
              <ExpertAvatar photoUrl={null} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontWeight: 700 }}>公認心理師・（例）山田 花子</div>
                <div className="qtext">
                  スクールカウンセラーとして10年。不登校のご家庭への対応を専門にしています。（本人確認が完了した専門家の自己紹介がここに表示されます）
                </div>
              </div>
            </div>
          </>
        ) : (
          experts.map((e) => {
            const link = safeHttpUrl(e.link_url);
            return (
              <div key={e.id} className="card" style={{ gap: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
                  <ExpertAvatar photoUrl={e.photo_url} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontWeight: 700 }}>{e.credential}・{e.name}</div>
                    {e.bio && (
                      <div className="qtext" style={{ whiteSpace: 'pre-wrap' }}>
                        {e.bio}
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
                <div className="row" style={{ gap: 10 }}>
                  <Link href={`/ask?expert=${e.id}`} className="btn-secondary" style={{ alignSelf: 'flex-start' }}>
                    この専門家に相談する
                  </Link>
                  {/* この専門家が今までどう回答してきたかを見られる個別ページ（2026-10-12追加） */}
                  <Link href={`/experts/${e.id}`} className="backlink" style={{ alignSelf: 'flex-start', margin: 0 }}>
                    この人の回答を見る →
                  </Link>
                </div>
              </div>
            );
          })
        )}

        {/* 専門家の募集・ログインは運営・専門家向けの導線で、相談に来た保護者が主役の
            このページの本題ではないため、以前は他の導線と同じ太さのbacklinkで並んでいた
            ものを、区切り線を挟んでより控えめな位置づけに整理した（2026-10-14）。 */}
        <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 10 }}>
          <Link href="/expert/recruit" className="backlink" style={{ margin: '0 0 4px', fontSize: 12 }}>
            専門家として登録を希望される方はこちら →
          </Link>
          <Link href="/expert/login" className="backlink" style={{ margin: '0 0 14px', fontSize: 12 }}>
            すでに登録済みの専門家の方はこちらからログイン →
          </Link>
        </div>
        </div>
        <PcSidebar hideExperts />
      </div>
      <BottomNav />
    </div>
  );
}
