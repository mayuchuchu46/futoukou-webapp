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
            つらいときはこちら
          </button>
          <Link href="/about" className="aboutlink">
            どうする先生とは？
          </Link>
        </div>
      </div>
      <span className="supervision-note">
        {supervised ? '専門家監修済み' : '専門家監修：準備中・ベータ版・無料でお試しいただけます'}
      </span>

      {crisisOpen && <CrisisModal onClose={() => setCrisisOpen(false)} />}
    </div>
  );
}
