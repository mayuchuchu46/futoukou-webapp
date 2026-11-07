'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CATS } from '@/lib/categories';
import { Consultation, metaLabel } from '@/lib/types';
import { SENPAI_CREDENTIAL } from '@/lib/config';
import { relativeTimeLabel } from '@/lib/relativeTime';

type Expert = { id: string; name: string; credential: string };

// 旧/expert/dashboardの回答キュー・回答済み一覧（DashboardClient.tsx）を、
// アカウントページに統合するために切り出したもの（2026-11-01、「アカウントページに、
// 専門家や保護者の管理内容も入れ込んじゃえばいい」との方針を受けて）。
// 元のapp-shell・headerは/accountの外枠と重複するため持ち込まず、カード類だけを出す。
export default function ExpertManagementPanel({
  expert,
  pending,
  deferredPending,
  answeredByMe,
  consultRequestCount = 0,
  hasEarningsHistory = false,
}: {
  expert: Expert;
  pending: Consultation[];
  // 「あとで見る」に退避済みの相談（2026-11-07追加）。本人ごとの退避状態なので、
  // 他の専門家・経験者のキューには影響しない。
  deferredPending: Consultation[];
  answeredByMe: Consultation[];
  // 「この方に直接相談をリクエストする」が押された件数。オンライン相談リンク
  // （online_consult_url）を設定済みの場合は常に0（呼び出し側で判定済み）。
  consultRequestCount?: number;
  // 2026-11-01以前の旧価格体系で、実際に報酬が発生した回答が1件でもあるか。
  // falseなら「報酬を見る」リンク自体を出さない（常に無料になった今、誰も
  // 報酬が発生していない人にこのリンクを出す意味がないため）。
  hasEarningsHistory?: boolean;
}) {
  const router = useRouter();
  // 経験者が回答するとき、専門家と全く同じ入力欄しか見えないと「専門的な判断を
  // しなきゃいけないのでは」と不安になりやすい（2026-11-07、「経験者からすると、
  // 専門家じゃないのに答えていいのだろうか…という不安がよぎったりする」との
  // 指摘を受けて）。読む側には既に「あくまで個人の経験・感想です」という免責が
  // あるが、書く側（この画面）には何も無かったため、回答者が経験者の場合だけ
  // 入力欄の近くに一言添える。
  const isSenpai = expert.credential === SENPAI_CREDENTIAL;
  const [items, setItems] = useState(pending);
  const [deferredItems, setDeferredItems] = useState(deferredPending);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [deferring, setDeferring] = useState<string | null>(null);
  // AIの回答は初期状態では畳んでおく（2026-11-07、「専門家が自分の判断を
  // 先に作れるように、AI回答にすぐ引きずられない見せ方にしたい」との方針）。
  const [aiAnswerOpen, setAiAnswerOpen] = useState<Record<string, boolean>>({});
  const ANSWERED_PAGE_SIZE = 3;
  const [answeredVisibleCount, setAnsweredVisibleCount] = useState(ANSWERED_PAGE_SIZE);
  // 「あとで見る」セクションはデフォルト畳んでおく（最初から全部開くと、結局
  // バッジの数字と同じ分量が画面に出てしまい、今回の目的＝スッキリ見せる、に反するため）。
  const [deferredOpen, setDeferredOpen] = useState(false);

  async function submitAnswer(id: string) {
    const answer = drafts[id];
    if (!answer || !answer.trim()) return;
    setSubmitting(id);
    const res = await fetch('/api/expert/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consultation_id: id, answer }),
    });
    setSubmitting(null);
    if (res.ok) {
      setItems((list) => list.filter((it) => it.id !== id));
      setDeferredItems((list) => list.filter((it) => it.id !== id));
    } else {
      const data = await res.json();
      alert(data.error || '送信に失敗しました');
    }
  }

  // 「あとで見る」へ退避／呼び戻し（2026-11-07追加）。回答そのものには触れず、
  // 表示上の仕分け（expert_consultation_reviews）だけを更新する。
  async function deferItem(id: string) {
    setDeferring(id);
    const res = await fetch('/api/expert/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consultation_id: id, action: 'defer' }),
    });
    setDeferring(null);
    if (res.ok) {
      setItems((list) => {
        const moved = list.find((it) => it.id === id);
        if (moved) setDeferredItems((d) => [...d, moved]);
        return list.filter((it) => it.id !== id);
      });
    } else {
      // 2026-11-07、失敗理由が分からず原因調査しづらかったため、サーバーからの
      // エラーメッセージをそのまま出すように変更。
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'あとで見るへの移動に失敗しました');
    }
  }

  async function undeferItem(id: string) {
    setDeferring(id);
    const res = await fetch('/api/expert/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consultation_id: id, action: 'undefer' }),
    });
    setDeferring(null);
    if (res.ok) {
      setDeferredItems((list) => {
        const moved = list.find((it) => it.id === id);
        if (moved) setItems((d) => [...d, moved]);
        return list.filter((it) => it.id !== id);
      });
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || '一覧への呼び戻しに失敗しました');
    }
  }

  async function logout() {
    await fetch('/api/expert/logout', { method: 'POST' });
    router.refresh();
  }

  function PendingCard({ item, deferred }: { item: Consultation; deferred: boolean }) {
    const cat = CATS[item.category] || CATS.other;
    return (
      <div className="card">
        <div className="row">
          <div className={`cat-badge ${cat.cls}`}>{cat.label}</div>
          {item.requested_expert_id === expert.id && (
            <span className="muted" style={{ fontWeight: 700 }}>あなた指名の相談</span>
          )}
          {metaLabel(item) && <span className="muted">{metaLabel(item)}</span>}
          {/* 「専門家・経験者が見たときに回答したくなるような誘導」の一環
              （2026-11-07追加）。投稿からの経過時間を添えることで、「今まさに
              困っている人がいる」という実感を持ちやすくする（ホームの一覧で
              使っているrelativeTimeLabelと同じ表示）。 */}
          {item.created_at && <span className="muted">{relativeTimeLabel(item.created_at)}</span>}
        </div>
        <div className="qtext">{item.question}</div>
        {/* すでにAIの回答がこのページで読まれている（＝困っている人に実際に
            届いている）ことが伝わると、「ここに専門家・経験者としての一言を
            足すと、誰かの役に立つ」という実感につながりやすい。views/likesは
            selectで既に取得済みのため、ここでは表示のみ追加（2026-11-07）。 */}
        {(item.views > 0 || item.likes > 0) && (
          <div className="muted" style={{ fontSize: 12 }}>
            {item.views > 0 && `すでに${item.views}回読まれています`}
            {item.views > 0 && item.likes > 0 && '・'}
            {item.likes > 0 && `「参考になった」が${item.likes}件付いています`}
          </div>
        )}
        {/* 2026-11-01、専門家への質問をAI回答つきの相談に統合したのに伴い、AIが
            既にどう答えているかをここに表示する（以前はrequest_type==='expert'の
            相談にAI回答が存在しなかったため、質問文だけが出ていた）。専門家・
            経験者がAIの回答を踏まえて、それに付け足す形で回答しやすくする。
            2026-11-07、初期状態では畳んでおき、ボタンで展開する形に変更。
            先にAIの回答を読むと専門家の判断がそれに引っ張られやすいため、
            まず相談文だけを見て自分の考えを作ってから、必要に応じて
            AIの回答と照合できるようにする。 */}
        {item.answer && (
          aiAnswerOpen[item.id] ? (
            <div className="muted" style={{ fontSize: 13, background: 'var(--bg)', borderRadius: 8, padding: '8px 10px', whiteSpace: 'pre-wrap' }}>
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 700 }}>AIの回答：</span>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ fontSize: 12 }}
                  onClick={() => setAiAnswerOpen({ ...aiAnswerOpen, [item.id]: false })}
                >
                  閉じる
                </button>
              </div>
              {item.answer}
            </div>
          ) : (
            <button
              type="button"
              className="btn-ghost"
              style={{ fontSize: 13, alignSelf: 'flex-start' }}
              onClick={() => setAiAnswerOpen({ ...aiAnswerOpen, [item.id]: true })}
            >
              AIの回答を見る
            </button>
          )
        )}
        {isSenpai && (
          <div className="muted" style={{ fontSize: 12 }}>
            専門的な判断ではなく、ご自身の経験に基づいてお答えいただければ十分です。
          </div>
        )}
        {/* 募集ページ（/expert/recruit・/senpai/recruit）では「回答がプロフィールへの
            露出・集客になる」と説明しているが、実際に回答する画面（ここ）には
            その一言が無く、書く直前に思い出せなかった。「回答したくなるような
            誘導」の一環として、送信直前の場所に短く再掲する（2026-11-07）。 */}
        <div className="muted" style={{ fontSize: 12 }}>
          回答すると、あなたのプロフィールへのリンクが表示されます。
        </div>
        <textarea
          className="input"
          rows={6}
          placeholder={isSenpai ? 'ご自身の経験を書いてください' : '回答を入力してください'}
          value={drafts[item.id] || ''}
          onChange={(e) => setDrafts({ ...drafts, [item.id]: e.target.value })}
        />
        <div className="row" style={{ gap: 8 }}>
          <button
            className="btn-primary"
            disabled={submitting === item.id || !(drafts[item.id] || '').trim()}
            onClick={() => submitAnswer(item.id)}
          >
            {submitting === item.id ? '送信中…' : '回答を送信する'}
          </button>
          {/* 「一度確認したものは確認済みにして、バッジの数字は未確認のものだけにしたい」
              との要望を受けて追加（2026-11-07）。回答するつもりがない／まだ決めて
              いない相談を、削除ではなく「あとで見る」として仕分けできるようにする。 */}
          {deferred ? (
            <button
              type="button"
              className="btn-ghost"
              disabled={deferring === item.id}
              onClick={() => undeferItem(item.id)}
            >
              一覧に戻す
            </button>
          ) : (
            <button
              type="button"
              className="btn-ghost"
              disabled={deferring === item.id}
              onClick={() => deferItem(item.id)}
            >
              あとで見る
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card" style={{ gap: 6 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          {/* expert.credentialはDB上の識別値（SENPAI_CREDENTIAL）のままなので、
              表示文言の「経験者」統一に合わせてここだけ固定文言に出し分ける
              （2026-11-03、「先輩保護者じゃなく経験者に統一して」との指示）。 */}
          <div style={{ fontWeight: 700 }}>
            {expert.credential === SENPAI_CREDENTIAL ? '経験者' : expert.credential}として登録中
          </div>
          <button type="button" className="btn-ghost" onClick={logout} style={{ fontSize: 12 }}>
            専門家としてログアウト
          </button>
        </div>
        <div className="muted" style={{ fontSize: 13 }}>{expert.name}さん</div>
        <div className="row">
          <a href="/expert/profile" className="btn-ghost">プロフィールを編集</a>
          {hasEarningsHistory && <a href="/expert/earnings" className="btn-ghost">報酬を見る</a>}
        </div>
      </div>

      {/* 「この方にもっと相談したい」の件数（2026-11-01追加）。回答した相談から
          読者がこのボタンを押すと、オンライン相談リンクが未設定の間はここに溜まる。
          設定すれば以降は読者が直接そのリンクへ誘導されるようになる。 */}
      {consultRequestCount > 0 && (
        <div className="card" style={{ gap: 6, background: 'var(--sub)' }}>
          <div style={{ fontWeight: 700 }}>
            「もっと相談したい」と思った方が{consultRequestCount}人います
          </div>
          <div className="qtext" style={{ fontSize: 13 }}>
            オンライン相談のリンク（MOSH等のご自身の予約・決済ページ）を設定すると、以降はこの方々を直接そちらへご案内できます。
          </div>
          <a href="/expert/profile" className="btn-secondary" style={{ alignSelf: 'flex-start' }}>
            オンライン相談のリンクを設定する
          </a>
        </div>
      )}

      <div style={{ fontWeight: 700, marginTop: 8 }}>回答待ちの相談（{items.length}件）</div>
      {items.length === 0 && <div className="muted">今は回答待ちの相談はありません。</div>}
      {items.map((item) => (
        <PendingCard key={item.id} item={item} deferred={false} />
      ))}

      {/* 「あとで見る」に退避した相談（2026-11-07追加）。バッジの件数には含めず、
          見たい時だけ開く形にして、画面の情報量を増やさないようにする。 */}
      {deferredItems.length > 0 && (
        <>
          <button
            type="button"
            className="btn-ghost"
            style={{ alignSelf: 'flex-start', marginTop: 8 }}
            onClick={() => setDeferredOpen((v) => !v)}
          >
            {deferredOpen ? '閉じる' : `あとで見る（${deferredItems.length}件）を開く`}
          </button>
          {deferredOpen && deferredItems.map((item) => (
            <PendingCard key={item.id} item={item} deferred />
          ))}
        </>
      )}

      <div style={{ fontWeight: 700, marginTop: 16 }}>自分が回答した相談（直近20件）</div>
      {answeredByMe.length === 0 && <div className="muted">まだ回答した相談はありません。</div>}
      {answeredByMe.slice(0, answeredVisibleCount).map((item) => {
        const cat = CATS[item.category] || CATS.other;
        return (
          <div key={item.id} className="card">
            <div className={`cat-badge ${cat.cls}`}>{cat.label}</div>
            <div className="qtext">{item.question}</div>
            <div className="answer-label">回答内容</div>
            <div className="qtext">{item.expert_answer}</div>
          </div>
        );
      })}
      {answeredVisibleCount < answeredByMe.length && (
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setAnsweredVisibleCount((n) => n + ANSWERED_PAGE_SIZE)}
        >
          もっと見る（残り{answeredByMe.length - answeredVisibleCount}件）
        </button>
      )}
    </>
  );
}
