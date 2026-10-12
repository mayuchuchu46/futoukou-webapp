import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { getSupabaseAdmin } from '@/lib/supabase';

// データベースの最新状態（本人確認済みの専門家）を毎回サーバー側で取得するページなので、
// ビルド時の静的化はせず、リクエストごとに生成する。閲覧者ごとに表示が変わる情報は
// 含まない（誰が見ても同じ内容）ため、Cookieは読まずに済み、Suspenseで囲う必要もない。
export const instant = false;

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
    .select('id, name, credential, bio, photo_url, link_url')
    .eq('verified', true)
    .order('created_at', { ascending: true });
  return data || [];
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

        {experts.length === 0 ? (
          <>
            <div className="empty">現在、本人確認が完了した専門家の登録がありません。準備が整い次第、ここに掲載されます。</div>
            <div className="muted" style={{ margin: '4px 0 2px', fontSize: 12 }}>掲載イメージ（サンプル）</div>
            <div
              className="card"
              style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start', opacity: 0.6 }}
            >
              <img
                src="/assets/sensei_logo.png"
                alt=""
                style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              />
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
                  <img
                    src={e.photo_url || '/assets/sensei_logo.png'}
                    alt=""
                    style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
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

        <Link href="/expert/recruit" className="backlink" style={{ margin: '4px 0 0' }}>
          専門家として登録を希望される方はこちら →
        </Link>
        <Link href="/expert/login" className="backlink" style={{ margin: '0 0 14px', fontSize: 13 }}>
          すでに登録済みの専門家の方はこちらからログイン →
        </Link>
        </div>
        <PcSidebar hideExperts />
      </div>
      <BottomNav />
    </div>
  );
}
