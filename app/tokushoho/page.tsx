import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';

// 特定商取引法に基づく表記ページ（2026-10-19追加）。
// 「WEBサイトの下にコピーライトとかないけど大丈夫？」との指摘を受けた確認の中で、
// 特商法の表記自体がサイトのどこにも無いことが分かり対応した。
//
// 現時点（2026-10-19）では、読み放題会員・専門家への質問などの有料機能は
// app/terms/page.tsx「2. ベータ版について」のとおりまだ無料のベータ公開中で、
// 実際の課金導線は専門家監修・専門家登録が整うまで有効化していない
// （claude/futoukou-monetization-plan.md「課題1」参照）。
// このページは、有料機能を実際に開始する時点で適用される予定の運営者情報・支払条件を
// あらかじめ明記したもの。価格（lib/config.tsのMEMBERSHIP_PRICE_JPY等）はまだ確定ではなく
// 検討中のため、このページには記載しない（2026-10-19、「価格体系はまだ確定だから記載しないで」
// との指摘を受けて削除）。価格が確定し、有料サービスの提供を開始する際に、このページへ追記する。
// なお、「決済代行会社Stripe, Inc.を利用」としていた記載は、Stripeのアカウントが
// カードネットワーク側の事情により利用できなくなったため削除し、乗り換え先が未確定の
// 現時点では社名を出さない一般的な表現にしている（2026-10-31）。乗り換え先が決まったら
// 社名を明記する。
export default function TokushohoPage() {
  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <div className="card" style={{ gap: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>特定商取引法に基づく表記</div>

          <div className="qtext">
            現在、下記の有料機能は準備中のベータ公開期間中であり、実際の決済は行われていません
            （詳しくは<Link href="/terms">利用規約・免責事項</Link>をご覧ください）。
            このページは、有料機能の提供を開始する際に適用する予定の内容を、特定商取引法第11条に基づきあらかじめ表示するものです。
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>販売事業者</div>
            <div className="qtext">森 真弓（屋号：manapri）</div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>運営統括責任者</div>
            <div className="qtext">森 真弓</div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>所在地</div>
            <div className="qtext">
              〒150-0043<br />
              東京都渋谷区道玄坂1丁目10番8号渋谷道玄坂東急ビル2F-C
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>電話番号</div>
            <div className="qtext">
              ご請求いただければ、遅滞なく開示いたします。下記お問い合わせ先までご連絡ください。
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>メールアドレス</div>
            <div className="qtext">mail.manapri@gmail.com</div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>販売価格</div>
            <div className="qtext">
              現在検討中のため未定です。価格が確定し、有料サービスの提供を開始する際に本ページへ掲載します。
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>商品代金以外の必要料金</div>
            <div className="qtext">
              インターネット接続料金・通信料金等は、お客様のご負担となります（ご利用の通信環境により異なります）。
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>お支払方法</div>
            <div className="qtext">
              クレジットカード決済（決済代行会社を利用）。
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>お支払時期</div>
            <div className="qtext">
              読み放題会員（月額サブスクリプション）はお申し込み時、以降は毎月の更新日に自動で決済されます。専門家への質問（都度払い・チケット）はお申し込み時に決済されます。
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>サービスの提供時期</div>
            <div className="qtext">
              決済完了後、直ちにご利用いただけます。
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>返品・キャンセルについて</div>
            <div className="qtext">
              本サービスはデジタルサービスのため、提供開始後のお客様都合による返金には対応できません。<br />
              読み放題会員（月額サブスクリプション）はマイページからいつでも解約手続きができます。解約後は次回更新時からの課金が停止し、既にお支払い済みの期間については解約後もサービスをご利用いただけます。
            </div>
          </div>
        </div>
        <Link href="/privacy" className="backlink" style={{ margin: '14px 0' }}>プライバシーポリシーを見る →</Link>
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
}
