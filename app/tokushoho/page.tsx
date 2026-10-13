import Link from 'next/link';
import Header from '@/components/Header';
import { MEMBERSHIP_PRICE_JPY, EXPERT_PRICE_JPY, EXPERT_TICKET_PACK_PRICE_JPY, EXPERT_TICKET_PACK_COUNT } from '@/lib/config';

// 特定商取引法に基づく表記。Stripeで有料の決済（読み放題会員・専門家への質問）を
// 扱っているため掲載が必須のページ（2026-10-13 追加）。
// 運営者名・所在地・連絡先は、個人事業主としての開業手続き・バーチャルオフィスの
// 契約審査が完了していない時点では確定できないため、現時点でコードから確認できる
// 事実（屋号・価格・決済方法・提供時期・キャンセル規定の実際の挙動）のみを記載し、
// 未確定の項目は「準備中」と明示する。審査完了後、運営者名・所在地・連絡先メール
// アドレスを追記すること。
export default function TokushohoPage() {
  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <div className="card" style={{ gap: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>特定商取引法に基づく表記</div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>販売事業者</div>
            <div className="qtext">屋号「manapri」（個人事業主）</div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>運営責任者</div>
            <div className="qtext muted">準備中（確定後、記載します）</div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>所在地・電話番号</div>
            <div className="qtext">
              現在、事業所所在地の手続きが完了していないため確定前です。ご請求をいただいた場合は、下記メールアドレス宛のご連絡から遅滞なく開示いたします。
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>メールアドレス</div>
            <div className="qtext">mail.manapri@gmail.com</div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>販売価格</div>
            <div className="qtext">
              読み放題会員（月額）：{MEMBERSHIP_PRICE_JPY.toLocaleString()}円（税込）<br />
              専門家への質問チケット（{EXPERT_TICKET_PACK_COUNT}回分）：{EXPERT_TICKET_PACK_PRICE_JPY.toLocaleString()}円（税込）<br />
              専門家への都度質問：{EXPERT_PRICE_JPY.toLocaleString()}円（税込）
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>商品代金以外の必要料金</div>
            <div className="qtext">なし（インターネット接続料金・通信費はお客様のご負担となります）</div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>お支払い方法</div>
            <div className="qtext">クレジットカード決済（Stripe）</div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>お支払い時期</div>
            <div className="qtext">お申し込み時に即時決済されます。読み放題会員（サブスクリプション）は、契約が継続する限り毎月同日に自動で決済されます。</div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>サービスのご提供時期</div>
            <div className="qtext">決済完了後、即時にご利用いただけます。</div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>返品・キャンセルについて</div>
            <div className="qtext">
              読み放題会員（サブスクリプション）は、アカウントページからいつでも解約できます。解約後は次回更新分からの請求が停止し、解約時点までにご利用いただいた分の返金はありません。<br />
              専門家への都度質問・質問チケットは、デジタルサービスの性質上、原則として返金は行っておりません。ただしご利用者からのフィードバックの内容により、運営の判断で返金を行う場合があります。
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>動作環境</div>
            <div className="qtext">スマートフォン・パソコンの標準的なWebブラウザでご利用いただけます。</div>
          </div>
        </div>
        <Link href="/terms" className="backlink" style={{ margin: '14px 0' }}>利用規約を見る →</Link>
        <Link href="/privacy" className="backlink" style={{ margin: '-10px 0 14px' }}>プライバシーポリシーを見る →</Link>
      </div>
    </div>
  );
}
