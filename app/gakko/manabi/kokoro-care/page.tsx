import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { MANABI_TAYOUKA_GAKKO } from '@/lib/data/manabiTayoukaGakko';

// 学びの多様化学校（旧：不登校特例校）のうち、「スクールカウンセラー・公認心理師・
// 学校心理士・精神保健福祉士・スクールソーシャルワーカー等の専門職の常駐・配置」が
// 公式の一次情報に明記されている学校だけを集めたページ（2026-10-29追加）。
// app/gakko/tsushin/kokoro-care/page.tsx（通信制高校版）と同じ考え方・基準。
//
// 2026-10-29に全84校の調査を完了している。詳細・個別校の確認根拠は
// lib/data/manabiTayoukaGakko.tsのコメント参照。
export const instant = false;

const PAGE_TITLE = '心のケア専門職が常駐する学びの多様化学校一覧';
const PAGE_DESCRIPTION =
  'スクールカウンセラー・公認心理師など心理の専門職が常駐・配置されていることが公式サイト等で確認できる学びの多様化学校（旧：不登校特例校）の一覧です。';

export const metadata: Metadata = {
  title: `${PAGE_TITLE} | ${SITE_NAME}`,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/gakko/manabi/kokoro-care` },
};

export default function ManabiKokoroCarePage() {
  const schools = MANABI_TAYOUKA_GAKKO.filter((s) => s.hasDedicatedMentalCareStaff);

  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '14px 0' }}>
            <Link href="/gakko" className="backlink">
              ‹ 学びの多様化学校トップへ
            </Link>
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>{PAGE_TITLE}</div>
            <div className="qtext">
              公式サイト・学校案内等で、スクールカウンセラー・公認心理師・学校心理士・精神保健福祉士・スクールソーシャルワーカーといった心理の専門職の常駐または配置が明記されている学びの多様化学校だけを集めました。「少人数制で手厚くサポート」といった一般的な説明のみの学校は、専門職の配置が未確認のため含めていません。
            </div>
            <div className="muted" style={{ fontSize: 12 }}>
              現時点で確認できているのは{schools.length}校です（全84校を調査済み）。これは「他の学校に専門職がいない」という意味ではなく、公式情報だけでは確認できていない学校も多いという状況です。今後、新たな一次情報が見つかれば対象校が増える可能性があります。
            </div>
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            {schools.length === 0 ? (
              <div className="muted">現時点で確認できている学校はありません。</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                {schools.map((s) => (
                  <Link
                    key={s.no}
                    href={`/gakko/school/${s.no}`}
                    style={{ display: 'block', borderBottom: '1px solid var(--border)', paddingBottom: 10, textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="qtext" style={{ fontWeight: 700 }}>
                      {s.name}
                      {s.branchName ? `（${s.branchName}）` : ''}
                    </div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                      {s.prefecture}{s.city}・{s.schoolType}・{s.publicPrivate}
                    </div>
                    {s.note && (
                      <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{s.note}</div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>このページについて</div>
            <div className="qtext">
              このページのデータは、学校ごとの公式サイト・学校案内PDF等の一次情報で確認できた事実のみを掲載しています。転編入の条件・学費・サポート体制は変更される場合があるため、気になる学校が見つかったら各校の公式サイトで直接ご確認ください。
            </div>
            <Link href="/gakko" className="muted" style={{ fontSize: 12, textDecoration: 'underline' }}>
              学びの多様化学校の全校一覧へ ›
            </Link>
          </div>
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
