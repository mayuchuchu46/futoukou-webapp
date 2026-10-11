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
            回答1件（200文字以上、具体的な「次の一手」を含む内容）につき ¥{EXPERT_PAYOUT_JPY}（税込）をお支払いします。振込はStripe（Stripe
            Express）を通じて毎月まとめて行います。ご登録後、プロフィール編集画面からStripeアカウントの登録（本人確認・振込先口座の入力）をお願いします。
          </div>
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>回答例</div>
          <div className="muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
            ①状況の受け止め→②具体的な「次の一手」→③注意点、の順で書いていただく形式です。
          </div>
          <div className="qtext" style={{ fontSize: 13 }}>
            Q. 小5の息子が、ここ2週間毎朝「お腹痛い」と言って学校に行きたがりません。無理に行かせるべきか悩んでいます。
          </div>
          <div className="qtext" style={{ whiteSpace: 'pre-wrap', background: 'var(--bg)', borderRadius: 8, padding: '10px 12px', fontSize: 13 }}>
            2週間も「お腹が痛い」が続いているとのこと、毎朝対応されるお母さま自身も気が休まらず、お疲れさまです。まずは「怠けているわけではない」という前提で見てあげてください。{'\n\n'}今日からできることとして、無理に学校へ行くかどうかの二択で迫らず、「今日は保健室だけ行ってみる」「午後から行ってみる」など、小さく分けた選択肢を一緒に考えてみてください。お腹の痛みが実際の体調不良である可能性もあるため、念のため一度小児科を受診しておくと安心材料になります。{'\n\n'}学校に行けない日が続いても、お子さんを責める言葉は避け、「行けなくても大丈夫」という安心感を伝えることが、長期的には回復への近道になります。
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
