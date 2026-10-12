'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CrisisModal from './CrisisModal';

export default function Header({ supervised }: { supervised: boolean }) {
  const [crisisOpen, setCrisisOpen] = useState(false);
  // ヘッダーに常時「ログイン／アカウント」導線を出すための、ログイン状態の軽量チェック。
  // 以前は会員登録・ログインへの入り口がマイページ・分析ノートの中に埋もれていて、
  // 「今すぐログインしたいだけ」の人にも毎回それらを掘ってもらう必要があったため追加した
  // （2026-10-12）。
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d) => setLoggedIn(!!d.loggedIn))
      .catch(() => setLoggedIn(false));
  }, []);

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
          {loggedIn !== null && (
            <Link href={loggedIn ? '/account' : '/account/login'} className="aboutlink">
              {loggedIn ? 'アカウント' : 'ログイン'}
            </Link>
          )}
        </div>
      </div>
      <span className="supervision-note">
        {supervised ? '専門家監修済み' : '専門家監修：準備中・ベータ版・無料でお試しいただけます'}
      </span>

      {crisisOpen && <CrisisModal onClose={() => setCrisisOpen(false)} />}
    </div>
  );
}
