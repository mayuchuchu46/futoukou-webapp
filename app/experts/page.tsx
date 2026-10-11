import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
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
};

async function getVerifiedExperts(): Promise<ExpertProfile[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('experts')
    .select('id, name, credential, bio, photo_url')
    .eq('verified', true)
    .order('created_at', { ascending: true });
  return data || [];
}

export default async function ExpertsPage() {
  const experts = await getVerifiedExperts();

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <Link href="/about" className="backlink" style={{ margin: '14px 0' }}>← もどる</Link>
        <h2 className="pagetitle">専門家一覧</h2>
        <div className="muted" style={{ marginBottom: 14 }}>
          有料の専門家相談でご回答いただく専門家です。公認心理師・臨床心理士など、運営が本人確認を行った方のみ掲載しています。
        </div>

        {experts.length === 0 ? (
          <div className="empty">現在、本人確認が完了した専門家の登録がありません。準備が整い次第、ここに掲載されます。</div>
        ) : (
          experts.map((e) => (
            <div key={e.id} className="card" style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
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
              </div>
            </div>
          ))
        )}

        <Link href="/expert/register" className="backlink" style={{ margin: '4px 0 0' }}>
          専門家として登録を希望される方はこちら →
        </Link>
        <Link href="/expert/login" className="backlink" style={{ margin: '0 0 14px', fontSize: 13 }}>
          すでに登録済みの専門家の方はこちらからログイン →
        </Link>
      </div>
      <BottomNav />
    </div>
  );
}
