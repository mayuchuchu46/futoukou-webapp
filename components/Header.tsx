'use client';

import { useState } from 'react';
import Link from 'next/link';
import CrisisModal from './CrisisModal';

export default function Header({ supervised }: { supervised: boolean }) {
  const [crisisOpen, setCrisisOpen] = useState(false);

  return (
    <div className="header">
      <div className="header-row">
        <div className="header-left">
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              padding: '10px 10px 10px 0',
              margin: '-10px -10px -10px 0',
            }}
          >
            <img src="/assets/wordmark_logo.png" className="wordmark" alt="どうする先生" />
            <span className="badge">不登校編</span>
          </Link>
          <div className="hero-catch">不登校のご家庭に、次の一手を。</div>
          <div className="hero-sub">「今、どうしたらいい？」にAIと専門家が具体的に回答します。</div>
        </div>
        <div className="header-right">
          <button className="crisis-btn" onClick={() => setCrisisOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-7.5-4.6-10-9.3C.5 8.2 2.3 5 5.6 5c1.9 0 3.4 1 4.4 2.5C11 6 12.5 5 14.4 5c3.3 0 5.1 3.2 3.6 6.7C15.5 16.4 12 21 12 21z" />
            </svg>
            つらいときはこちら
          </button>
          <Link href="/about" className="aboutlink">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v6" />
              <circle cx="12" cy="7.5" r="0.5" fill="currentColor" stroke="none" />
            </svg>
            どうする先生とは？
          </Link>
        </div>
      </div>
      <div className="muted" style={{ fontSize: 11 }}>
        {supervised ? '専門家監修済み' : '専門家監修：準備中・ベータ版・無料でお試しいただけます'}
      </div>

      {crisisOpen && <CrisisModal onClose={() => setCrisisOpen(false)} />}
    </div>
  );
}
