import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import ExpertAvatar from '@/components/ExpertAvatar';
import SenpaiConsultCta from '@/components/SenpaiConsultCta';
import { getSupabaseAdmin } from '@/lib/supabase';
import { expertDisplayName } from '@/lib/expertDisplay';
import { SENPAI_CREDENTIAL } from '@/lib/config';

// 先輩保護者（経験者）の公開プロフィールページ。app/experts/[id]/page.tsx（専門家向け）
// と同じ構成だが、こちらには「この方に相談する」ボタンは置かない（オンライン通話・
// チャットリレーの予約・決済の仕組みがまだ準備中のため。2026-10-31、「私の情報
// トップにだして」との依頼を受けて、トップのカードから遷移できるプロフィールページ
// として新規作成）。
export const instant = false;

type SenpaiProfile = {
  id: string;
  name: string;
  credential: string;
  bio: string;
  photo_url: string | null;
  link_url: string | null;
};

async function getVerifiedSenpaiById(id: string): Promise<SenpaiProfile | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('experts')
    .select('id, name, display_name, credential, bio, photo_url, link_url')
    .eq('id', id)
    .eq('verified', true)
    .eq('credential', SENPAI_CREDENTIAL)
    .single();
  return data ? { ...data, name: expertDisplayName(data) } : null;
}

function safeHttpUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}

export default async function SenpaiProfilePublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const senpai = await getVerifiedSenpaiById(id);

  if (!senpai) {
    notFound();
  }

  const link = safeHttpUrl(senpai.link_url);

  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <Link href="/" className="backlink" style={{ margin: '14px 0' }}>← もどる</Link>

          <div className="card" style={{ gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
              <ExpertAvatar photoUrl={senpai.photo_url} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{senpai.credential}・{senpai.name}</div>
                {senpai.bio && (
                  <div className="qtext" style={{ whiteSpace: 'pre-wrap' }}>
                    {senpai.bio}
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
            {/* 相談の予約・決済の仕組み自体はまだ準備中だが、「この方に相談する」という
                導線は見せておきたいとの依頼（2026-10-31）を受けて、ボタンの見た目は
                出しつつ、押しても実際の相談フローには進めない（準備中バッジ付き・
                クリックで案内文を表示するのみ）形にした。このページ自体はサーバー
                コンポーネントのため、クリック処理はSenpaiConsultCta（クライアント
                コンポーネント）に切り出している。 */}
            <SenpaiConsultCta />
          </div>
        </div>
        <PcSidebar hideExperts />
      </div>
      <BottomNav />
    </div>
  );
}
