'use client';

import { useState } from 'react';
import Link from 'next/link';
import CrisisModal from './CrisisModal';

export default function Header({ supervised }: { supervised: boolean }) {
  const [crisisOpen, setCrisisOpen] = useState(false);

  return (
    <div className="header">
      <div className="header-row" style={{ alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <img src="/assets/wordmark_logo.png" className="wordmark" alt="どうする先生" />
            <span className="badge">不登校編</span>
          </Link>
          <div className="hero-catch">不登校のご家庭に、次の一手を。</div>
          <div className="hero-sub">「今、どうする？」にAIと専門家が具体的に回答します。</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, paddingTop: 2 }}>
          <button className="crisis-btn" onClick={() => setCrisisOpen(true)}>
            つらいときはこちら
          </button>
          <Link href="/about" className="aboutlink">どうする先生とは？</Link>
        </div>
      </div>
      <div className="muted" style={{ fontSize: 11 }}>
        {supervised ? '専門家監修済み' : '専門家監修：準備中・ベータ版・無料でお試しいただけます'}
      </div>

      {crisisOpen && <CrisisModal onClose={() => setCrisisOpen(false)} />}
    </div>
  );
}
