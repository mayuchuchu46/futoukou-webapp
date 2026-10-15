'use client';

import { useEffect, useState } from 'react';
import { getUid } from '@/lib/uid';

// AIの無料相談のすぐ下に出す、会員登録の案内。
// 「質問するには会員登録が必要」という強制ゲートにはせず、相談自体はこれまで通り
// 誰でも匿名で利用できるまま、「残しておける」という価値を見せて登録を促す。
// 表示対象は「この相談の本人（同じブラウザのdsk_uid）」かつ「未ログイン」の場合のみ。
// 以前は「今はしない」でこの相談単位にスキップできたが、毎回出してよいとの判断で
// スキップ機能ごと削除した（2026-10-13）。
// 以前は未登録の本人にだけ「登録すれば残せます」という勧誘を出し、会員登録済みの本人には
// 何も表示していなかった（AIの回答を読んで終わり）。これだと「相談するほど分析ノートが
// 詳しくなっていく」という、このサービスがChatGPT等の汎用AIと違う一番の価値を、
// 一番体感してほしい会員本人が相談のたびに確認できていなかった。会員本人には代わりに
// 「この相談は分析ノートに記録されました」という一言＋分析ノートへの導線を出す
// （2026-10-15、「普通のチャッピーとかの回答となにが違うの？と思われそう」との指摘を受けて追加）。
export default function SaveConsultationPrompt({ id, authorId }: { id: string; authorId: string }) {
  const [state, setState] = useState<'hidden' | 'register' | 'saved'>('hidden');

  useEffect(() => {
    let cancelled = false;

    try {
      if (getUid() !== authorId) return; // 本人の相談ではない（共有リンク等から見に来た人には出さない）
    } catch {
      return;
    }

    fetch('/api/me')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setState(data.loggedIn ? 'saved' : 'register');
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [id, authorId]);

  if (state === 'hidden') return null;

  if (state === 'saved') {
    return (
      <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
        <div className="answer-label" style={{ fontSize: 14 }}>
          <span aria-hidden="true">✏️</span>
          この相談は分析ノートに記録されました
        </div>
        <div className="qtext" style={{ fontSize: 13 }}>
          相談を重ねるほど、お子さんの状況の整理や次にできそうなことがノートに書き足されていきます。
        </div>
        <a href="/notebook" className="btn-secondary">
          分析ノートを見る
        </a>
      </div>
    );
  }

  return (
    <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
      <div className="answer-label" style={{ fontSize: 14 }}>この相談、残しておけます</div>
      {/* 長い説明文1本ではなく、無料会員登録の魅力をポイントで整理して見せる形に変更
          （2026-10-13、「質問の蓄積で分析ノートが作られる」ことが伝わるように）。 */}
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text)', lineHeight: 1.9 }}>
        <li>この相談が「分析ノート」に記録されます</li>
        <li>相談を重ねるほど、お子さんの状況をAIが整理します</li>
        <li>次にできそうなこと・言葉かけの提案もノートに書き足されます</li>
      </ul>
      <a className="btn-primary" href={`/account/register?next=${encodeURIComponent('/notebook')}`}>
        無料で登録する
      </a>
      <a href="/notebook" className="muted" style={{ fontSize: 12, textDecoration: 'underline' }}>
        分析ノートを見る
      </a>
    </div>
  );
}
