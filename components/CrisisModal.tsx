'use client';

export default function CrisisModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="crisis-overlay" onClick={onClose}>
      <div className="crisis-box" onClick={(e) => e.stopPropagation()}>
        <img src="/assets/crisis_illustration.png" style={{ width: 150, height: 'auto' }} alt="" />
        <div style={{ fontWeight: 700, fontSize: 15 }}>一人で抱え込まないでください</div>
        <div className="hotline">
          <div className="muted">24時間子供SOSダイヤル</div>
          <div className="num">0120-0-78310</div>
        </div>
        <div className="hotline">
          <div className="muted">よりそいホットライン</div>
          <div className="num">0120-279-338</div>
        </div>
        {/* 「つらいときはこちら」はHeaderからほぼ全ページで開けるため、相談窓口ページ
            （/support）への一番目立つ入り口としてここにもリンクを置いた（2026-10-13）。 */}
        <a href="/support" className="muted" style={{ fontSize: 12, textDecoration: 'underline' }}>
          ほかの相談窓口も見る →
        </a>
        <button className="btn-secondary" style={{ width: '100%' }} onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  );
}
