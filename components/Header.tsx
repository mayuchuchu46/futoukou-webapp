'use client';

import { useState } from 'react';
import CrisisModal from './CrisisModal';

export default function Header({ supervised }: { supervised: boolean }) {
  const [crisisOpen, setCrisisOpen] = useState(false);

  return (
    <div className="header">
      <img src="/assets/header_accent.png" className="header-accent" alt="" />
      <div className="header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/assets/wordmark_logo.png" className="wordmark" alt="どうする先生" />
          <span className="badge">不登校編</span>
        </div>
      </div>
      <div className="header-row">
        <div className="muted" style={{ maxWidth: 230 }}>
          同じように悩んでいる人の相談と、どうする先生の回答
        </div>
        <button className="crisis-btn" onClick={() => setCrisisOpen(true)}>
          つらいときはこちら
        </button>
      </div>
      <div className="muted" style={{ fontSize: 11 }}>
        {supervised ? '専門家監修済み' : 'AIによる回答です（専門家監修：準備中・ベータ版・無料でお試しいただけます）'}
      </div>

      {crisisOpen && <CrisisModal onClose={() => setCrisisOpen(false)} />}
    </div>
  );
}
