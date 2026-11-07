import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import ExpertAvatar from '@/components/ExpertAvatar';
import BackButton from '@/components/BackButton';
import { getSupabaseAdmin } from '@/lib/supabase';
import { expertDisplayName } from '@/lib/expertDisplay';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { SENPAI_CREDENTIAL } from '@/lib/config';

// 経験者（先輩保護者）一覧ページ。app/experts/page.tsx（専門家向け）と同じ構成
// （2026-11-07追加）。以前は経験者の個別プロフィール（/senpai/[id]）・募集ページ
// （/senpai/recruit）・登録ページ（/senpai/register）はあったが、経験者を横断的に
// 見て選べる一覧ページ自体が無かった（「専門家・経験者に直接相談する、への誘導も
// あっていいかも。それを押すと、専門家と経験者それぞれの一覧が出てきて、そこから
// 直接選ぶ」との指摘を受けて追加）。
export const instant = false;

export const metadata: Metadata = {
  title: `経験者一覧｜${SITE_NAME}`,
  description: '不登校の相談に対応する、運営が確認済みの経験者（先輩保護者）の一覧です。',
  alternates: { canonical: `${SITE_URL}/senpai` },
};

type SenpaiProfile = {
  id: string;
  name: string;
  credential: string;
  bio: string;
  photo_url: string | null;
  link_url: string | null;
};

async function getVerifiedSenpai(): Promise<SenpaiProfile[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('experts')
    .select('id, name, display_name, credential, bio, photo_url, link_url')
    .eq('verified', true)
    // 専門家は資格を持つ「専門家一覧」（/experts）に別掲載しているため、
    // ここには経験者（credential === SENPAI_CREDENTIAL）のみを出す。
    .eq('credential', SENPAI_CREDENTIAL)
    .order('created_at', { ascending: true });
  return (data || []).map((e) => ({ ...e, name: expertDisplayName(e) }));
}

function safeHttpUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}

export default async function SenpaiListPage() {
  const senpaiList = await getVerifiedSenpai();

  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
        <BackButton />
        <h1 className="pagetitle">経験者一覧</h1>
        <div className="muted" style={{ marginBottom: 14 }}>
          無料でご質問いただける経験者（先輩保護者）です。不登校を実際に経験され、運営が内容を確認した方のみ掲載しています。
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 8, marginBottom: 14 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>経験者への相談について</div>
          <div className="qtext" style={{ fontSize: 13 }}>
            相談文を経験者本人が直接読み、文章で回答します。あくまで個人の経験・感想としての回答になります。
          </div>
          <Link href="/ask" className="backlink" style={{ fontSize: 13, margin: 0 }}>
            相談するページへ →
          </Link>
        </div>

        {senpaiList.length === 0 ? (
          <>
            <div className="empty">現在、運営の確認が完了した経験者の登録がありません。準備が整い次第、ここに掲載されます。</div>
            <div className="muted" style={{ margin: '4px 0 2px', fontSize: 12 }}>掲載イメージ（サンプル）</div>
            <div
              className="card"
              style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start', opacity: 0.6 }}
            >
              <ExpertAvatar photoUrl={null} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontWeight: 700 }}>経験者・（例）佐藤 由美</div>
                <div className="qtext">
                  子どもの不登校を経験した保護者です。同じ立場だからこそ話せることを大事にしています。（運営の確認が完了した経験者の自己紹介がここに表示されます）
                </div>
              </div>
            </div>
          </>
        ) : (
          senpaiList.map((e) => {
            const link = safeHttpUrl(e.link_url);
            return (
              <div key={e.id} className="card" style={{ gap: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
                  <ExpertAvatar photoUrl={e.photo_url} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontWeight: 700 }}>経験者・{e.name}</div>
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
                  <Link href={'/ask'} className="btn-secondary" style={{ alignSelf: 'flex-start' }}>
                    どうする先生で相談してみる
                  </Link>
                  <Link href={`/senpai/${e.id}`} className="backlink" style={{ alignSelf: 'flex-start', margin: 0 }}>
                    この人のプロフィールを見る →
                  </Link>
                </div>
              </div>
            );
          })
        )}

        <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 10 }}>
          <Link href="/senpai/recruit" className="backlink" style={{ margin: '0 0 4px', fontSize: 12 }}>
            経験者として登録を希望される方はこちら →
          </Link>
          <Link href="/expert/login" className="backlink" style={{ margin: '0 0 14px', fontSize: 12 }}>
            すでに登録済みの方はこちらからログイン →
          </Link>
        </div>
        </div>
        <PcSidebar hideExperts />
      </div>
      <BottomNav />
    </div>
  );
}
