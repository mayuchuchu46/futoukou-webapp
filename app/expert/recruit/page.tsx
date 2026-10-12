import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

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
            回答1件（具体的な「次の一手」を含む内容）につき報酬をお支払いします。文字数の目安・金額は決まり次第こちらでお知らせします。振込は、決済代行サービスのStripe（Stripe
            Express）を通じて毎月まとめて行います。ご登録後、プロフィール編集画面からStripeアカウントの登録（本人確認・振込先口座の入力）をお願いします。
          </div>
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>回答例</div>
          <div className="muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
            ①状況の受け止め→②具体的な「次の一手」→③注意点、の順で書いていただく形式です。
          </div>
          <div className="qtext" style={{ fontSize: 13 }}>
            Q. 小5の息子が、ここ2週間毎朝「お腹痛い」と言って学校に行きたがりません。無理に行かせるべきか悩んでいます。通常の腹痛の症状なのか、精神的なものから来てるのか、その判断基準を知りたいです。
          </div>
          <div className="qtext" style={{ whiteSpace: 'pre-wrap', background: 'var(--bg)', borderRadius: 8, padding: '10px 12px', fontSize: 13 }}>
            2週間にわたり毎朝腹痛を訴えて登校を渋っている状態は、心理的なストレスが自律神経を通じて身体症状として表れている可能性があります。本人が意図的に仮病を使っているわけではない、という前提で関わることが大切です。{'\n\n'}対応としては、「行く・行かない」の二択ではなく、保健室登校や午後からの登校など、段階を踏んだ選択肢を提示する「スモールステップ」の考え方が有効です。あわせて、起立性調節障害など身体的な要因の可能性も除外しておくため、一度小児科を受診しておくと安心材料になります。{'\n\n'}登校できない日が続いても叱責は避け、「行けなくても大丈夫」という受容的な態度を一貫して示すことが、回復への近道です。症状や様子の変化は、学校とも情報共有しておくとよいでしょう。
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
          専門家として登録する（事前登録受付）
        </Link>
        <Link href="/expert/login" className="backlink" style={{ margin: '0 0 14px', fontSize: 13 }}>
          すでに登録済みの専門家の方はこちらからログイン →
        </Link>
      </div>
      <BottomNav />
    </div>
  );
}
