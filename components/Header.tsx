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

  const accountTab = loggedIn !== null && (
    <Link href={loggedIn ? '/account' : '/account/login'} className="account-tab">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20a8 8 0 0 1 16 0z" />
      </svg>
      {/* 未ログイン時は「ログイン」だけでなく新規登録も誘導したいので、ログインページへの
          リンクのまま文言だけ両方を伝える形にする（/account/loginからは
          /account/registerへの導線が既にある）。 */}
      {loggedIn ? 'アカウント' : 'ログイン / 無料登録'}
    </Link>
  );

  return (
    <div className="header">
      <div className="header-row">
        <div className="header-left">
          {/* ロゴ＋「不登校編」バッジと、専門家監修バッジを同じ行に並べる。PC幅では横に
              並べる余白があるが、スマホ幅では折り返して2行になる（2026-10-12、
              「専門家監修」バッジをロゴの横に置きたいという指摘を受けて、ヘッダー右側の
              空きスペースに固定表示する案から変更）。 */}
          <div className="header-brand-row">
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
            <span className="supervision-note">
              {supervised ? '専門家監修済み' : '専門家監修：準備中・ベータ版・無料でお試しいただけます'}
            </span>
          </div>
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
          {/* ログイン／アカウントへの導線。スマホ幅では他のリンクと同じく縦積みの
              チップとして自然に流す（固定表示にすると、右上の限られた縦スペースで
              他要素と重なりやすく実機で崩れたため）。PC幅では横幅に余裕があるので
              画面右上の角にタブのようにぶら下げて固定表示する（CSS側で分岐）。
              （2026-10-12、header-rightの外に切り出していたが元に戻した） */}
          {accountTab}
        </div>
      </div>

      {crisisOpen && <CrisisModal onClose={() => setCrisisOpen(false)} />}
    </div>
  );
}
