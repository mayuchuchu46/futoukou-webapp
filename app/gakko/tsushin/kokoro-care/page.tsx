import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { CORRESPONDENCE_HIGH_SCHOOLS } from '@/lib/data/correspondenceHighSchools';

// 通信制高校（広域）のうち、「スクールカウンセラー・公認心理師・学校心理士・精神保健福祉士・
// スクールソーシャルワーカー等の専門職の常駐・配置」が公式の一次情報に明記されている学校だけを
// 集めたページ（2026-10-28追加）。
//
// 背景：通信制高校は私立校が多く、「少人数制」「手厚いサポート」といった打ち出しをしている
// 学校は非常に多いが、それが担任・教員による対応なのか、心理の専門職による対応なのかは
// 保護者にとって重要な違いにもかかわらず区別しにくい。lib/data/correspondenceHighSchools.ts
// の hasDedicatedMentalCareStaff フラグは、公式資料に専門職の名称・常駐が明記されている場合
// のみtrueにする方針で運用している（推測・一般論では立てない）。
//
// 注意：これは「心のケアが充実していない学校を除外した」という意味ではない。多くの学校は
// 単に専門職の配置について公式情報で確認できていない（＝未確認）だけであり、調査が進めば
// 対象校は増減しうる。
export const instant = false;

const PAGE_TITLE = '心のケア専門職が常駐する通信制高校一覧';
const PAGE_DESCRIPTION =
  'スクールカウンセラー・公認心理師など心理の専門職が常駐・配置されていることが公式サイト等で確認できる通信制高校（広域）の一覧です。';

export const metadata: Metadata = {
  title: `${PAGE_TITLE} | ${SITE_NAME}`,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/gakko/tsushin/kokoro-care` },
};

export default function KokoroCarePage() {
  const schools = CORRESPONDENCE_HIGH_SCHOOLS.filter((s) => s.hasDedicatedMentalCareStaff);

  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '14px 0' }}>
            <Link href="/gakko?type=tsushin" className="backlink">
              ‹ 通信制高校トップへ
            </Link>
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>{PAGE_TITLE}</div>
            <div className="qtext">
              公式サイト・学校案内等で、スクールカウンセラー・公認心理師・学校心理士・精神保健福祉士・スクールソーシャルワーカーといった心理の専門職の常駐または配置が明記されている通信制高校（広域）だけを集めました。「少人数制で手厚くサポート」といった一般的な説明のみの学校は、専門職の配置が未確認のため含めていません。
            </div>
            <div className="muted" style={{ fontSize: 12 }}>
              現時点で確認できているのは{schools.length}校です。これは「他の学校に専門職がいない」という意味ではなく、公式情報だけでは確認できていない学校が大半という状況です。調査を進めるにつれて対象校は増える可能性があります。
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
                    href={`/gakko/tsushin/${s.no}`}
                    style={{ display: 'block', borderBottom: '1px solid var(--border)', paddingBottom: 10, textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="qtext" style={{ fontWeight: 700 }}>{s.name}</div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                      本校：{s.prefecture}{s.municipality}・設置者：{s.operator}
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
              このページのデータは、通信制高校ごとの公式サイト・学校案内PDF等の一次情報で確認できた事実のみを掲載しています。学費・入学条件・カリキュラム・最新のサポート体制は変更される場合があるため、気になる学校が見つかったら各校の公式サイトで直接ご確認ください。
            </div>
            <Link href="/gakko?type=tsushin" className="muted" style={{ fontSize: 12, textDecoration: 'underline' }}>
              通信制高校（広域）の全校一覧へ ›
            </Link>
          </div>
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
