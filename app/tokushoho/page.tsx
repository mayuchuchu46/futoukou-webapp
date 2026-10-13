import Link from 'next/link';
import Header from '@/components/Header';

// 特定商取引法に基づく表記。Stripeで有料の決済（読み放題会員・専門家への質問）を
// 扱っているため掲載が必須のページ（2026-10-13 追加）。
// 価格体系・決済方法・キャンセル規定はまだ正式に確定していないため、確定するまでは
// 掲載しない方針（2026-10-13）。運営責任者名・所在地も、バーチャルオフィスの契約審査が
// 完了していないため未掲載。確定した時点でそれぞれ追記すること。
// なお運営責任者名は、屋号（manapri）とは別に、運営者本人の氏名を記載する必要がある
// （個人事業主の特定商取引法表記では、屋号のみでは不十分とされる）。
export default function TokushohoPage() {
  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <div className="card" style={{ gap: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>特定商取引法に基づく表記</div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>販売事業者</div>
            <div className="qtext">manapri</div>
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
            <div style={{ fontWeight: 700, fontSize: 13 }}>販売価格・お支払い方法・キャンセルについて</div>
            <div className="qtext muted">準備中（価格体系・決済方法の確定後、記載します）</div>
          </div>
        </div>
        <Link href="/terms" className="backlink" style={{ margin: '14px 0' }}>利用規約を見る →</Link>
        <Link href="/privacy" className="backlink" style={{ margin: '-10px 0 14px' }}>プライバシーポリシーを見る →</Link>
      </div>
    </div>
  );
}
