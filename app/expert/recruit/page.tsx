import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { EXPERT_PAYOUT_JPY } from '@/lib/config';

// 一般利用者向けの/expertsとは別の、専門家（回答する側）募集専用ページ。
// 一覧用の個人情報（会員数など）は含まないため、ビルド時に静的化してよい。

export default function ExpertRecruitPage() {
  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <Link href="/about" className="backlink" style={{ margin: '14px 0' }}>← もどる</Link>
        <h2 className="pagetitle">専門家募集</h2>

        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="qtext">
            「どうする先生」は、不登校のご家庭に向けたAI相談サービスです。AIの回答とは別に、公認心理師・臨床心理士など資格をお持ちの専門家本人が、利用者からの相談に直接回答する機能があります。この回答を担当していただける専門家の方を募集しています。
          </div>
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>報酬</div>
          <div className="qtext">
            回答1件につき ¥{EXPERT_PAYOUT_JPY}（税込）をお支払いします。お支払い方法は、ご登録後に個別にご案内します。
          </div>
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>登録の流れ</div>
          <ol className="qtext" style={{ margin: 0, paddingLeft: 18 }}>
            <li>登録フォームにプロフィール（資格・自己紹介）を入力し、資格の登録証（画像またはPDF）を添付</li>
            <li>運営が登録証の内容を確認（本人確認）</li>
            <li>確認完了後、相談への回答が可能になります</li>
          </ol>
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>対象となる資格</div>
          <div className="qtext">
            公認心理師・臨床心理士など、不登校のご家庭への対応について専門知識をお持ちの方を対象としています。
          </div>
        </div>

        <Link href="/expert/register" className="btn-primary" style={{ textAlign: 'center' }}>
          専門家として登録する
        </Link>
        <Link href="/expert/login" className="backlink" style={{ margin: '0 0 14px', fontSize: 13 }}>
          すでに登録済みの専門家の方はこちらからログイン →
        </Link>
      </div>
      <BottomNav />
    </div>
  );
}
