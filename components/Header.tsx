'use client';

import { useState } from 'react';
import Link from 'next/link';
import CrisisModal from './CrisisModal';

export default function Header({ supervised }: { supervised: boolean }) {
  const [crisisOpen, setCrisisOpen] = useState(false);

  return (
    <div className="header">
      <div className="header-row" style={{ alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <img src="/assets/wordmark_logo.png" className="wordmark" alt="どうする先生" />
          <span className="badge">不登校編</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, paddingTop: 2 }}>
          <button className="crisis-btn" onClick={() => setCrisisOpen(true)}>
            つらいときはこちら
          </button>
          <Link href="/about" className="aboutlink">どうする先生とは？</Link>
        </div>
      </div>
      <div className="muted" style={{ maxWidth: 230 }}>
        同じように悩んでいる人の相談と、どうする先生の回答
      </div>
      <div className="muted" style={{ fontSize: 11 }}>
        {supervised ? '専門家監修済み' : 'AIによる回答です（専門家監修：準備中・ベータ版・無料でお試しいただけます）'}
      </div>

      {crisisOpen && <CrisisModal onClose={() => setCrisisOpen(false)} />}
    </div>
  );
}
