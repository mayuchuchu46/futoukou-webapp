'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Consultation } from '@/lib/types';
import { getUid } from '@/lib/uid';
import { schoolAwareAnswerSectionLabel } from '@/lib/expertDisplay';
import { EXPERT_VOLUNTEER_MODE, SENPAI_CREDENTIAL } from '@/lib/config';
import ExpertAvatar from '@/components/ExpertAvatar';

// 「この回答をした人」が一目で分かるよう、テキストリンクだけでなく写真・自己紹介
// つきの簡易プロフィールカードにした（2026-11-01、「この回答をした人って感じで
// プロフィールが出る感じがいいかも。答えた人は目立ちたいわけだから」との指摘を
// 受けて、リンク1行だけの控えめな見た目から、名前・顔写真・自己紹介が目立つ
// カードに変更）。
function AnswererMiniProfile({ experts }: { experts: NonNullable<Consultation['experts']> }) {
  if (!experts.id) return null;
  const isSenpai = experts.credential === SENPAI_CREDENTIAL;
  const href = isSenpai ? `/senpai/${experts.id}` : `/experts/${experts.id}`;
  // experts.credentialはDB上の識別値（SENPAI_CREDENTIAL）のままなので、
  // 表示文言の「経験者」統一に合わせてここだけ固定文言に出し分ける
  // （2026-11-03、「先輩保護者じゃなく経験者に統一して」との指示）。
  const credentialLabel = isSenpai ? '経験者' : experts.credential;
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        textDecoration: 'none',
        color: 'inherit',
        background: 'var(--sub)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '10px 12px',
      }}
    >
      <ExpertAvatar photoUrl={experts.photo_url} size={56} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{credentialLabel}・{experts.name}</span>
        {experts.bio && (
          <span className="muted qtext-clamp-2" style={{ fontSize: 12 }}>
            {experts.bio}
          </span>
        )}
        <span style={{ fontSize: 12, color: 'var(--main)', fontWeight: 700 }}>プロフィールを見る →</span>
      </div>
    </Link>
  );
}

// 専門家・経験者の回答がついた（またはつく予定の）相談の、AI回答の下に出す
// 追加セクション。
// 2026-11-01、専門家への質問を「AI回答に加えて、登録している専門家・経験者が
// 任意で回答してくれる」という単一の相談に統合したのに伴い、Stripe決済確認まわり
// （session_id・confirming・!item.paid表示）を撤去した。新しい相談は登録と同時に
// 必ずpaid:trueになるため、決済待ち・未決済の状態は存在しない。
//
// サーバー側は「会員ではない匿名の訪問者」として見えるべき初期状態（initialItem）を
// すでにSSR済み。ここではマウント後に本当のviewer_id（本人／会員かどうか）で
// 再取得し、ロック解除が必要なら表示を差し替える。
// 回答した専門家・経験者にとっては、回答すること自体が自分のプロフィールへの
// 露出・集客になる（2026-11-01、「専門家や保護者にとっては、自分のプロフィールに
// 誘導することが目的」との方針を受けて追加）。オンライン相談リンク（online_consult_url）
// を設定済みならそこへ直接誘導し、未設定なら「もっと相談したい」の意思表示を記録するだけに
// して、専門家側のダッシュボードに件数を表示し設定を促す（メール通知の基盤はまだ無いため）。
function ConsultRequestButton({ expertId, consultationId, onlineConsultUrl }: { expertId: string; consultationId: string; onlineConsultUrl?: string | null }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');

  if (onlineConsultUrl) {
    return (
      <a
        href={onlineConsultUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="btn-secondary"
        style={{ alignSelf: 'flex-start', fontSize: 13, padding: '6px 14px' }}
      >
        この方に直接相談する →
      </a>
    );
  }

  if (state === 'sent') {
    return <div className="muted" style={{ fontSize: 12 }}>お伝えしました。ありがとうございます。</div>;
  }

  return (
    <button
      type="button"
      className="btn-ghost"
      disabled={state === 'sending'}
      style={{ alignSelf: 'flex-start', fontSize: 13, padding: '4px 10px' }}
      onClick={async () => {
        setState('sending');
        try {
          await fetch('/api/expert/consult-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ expert_id: expertId, consultation_id: consultationId, author_id: getUid() }),
          });
        } finally {
          setState('sent');
        }
      }}
    >
      {state === 'sending' ? '…' : 'この方にもっと相談したい（ご本人に伝わります）'}
    </button>
  );
}

export default function ResultClient({ id, initialItem }: { id: string; initialItem: Consultation }) {
  const [item, setItem] = useState<Consultation>(initialItem);
  const [feedbackSending, setFeedbackSending] = useState(false);

  async function sendFeedback(helpful: boolean) {
    setFeedbackSending(true);
    const res = await fetch('/api/consultations/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, author_id: getUid(), helpful }),
    });
    setFeedbackSending(false);
    if (res.ok) {
      setItem((prev) => ({ ...prev, expert_answer_helpful: helpful }));
    }
  }

  useEffect(() => {
    fetch(`/api/consultations?viewer_id=${getUid()}`)
      .then((r) => r.json())
      .then((data) => {
        const found = (data.consultations || []).find((c: Consultation) => c.id === id);
        if (found) setItem(found as Consultation);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="card">
      {item.refunded && (
        <div className="muted">
          この相談は、回答のお届けができなかったため運営にて非表示処理をいたしました。ご不便をおかけして申し訳ございません。
        </div>
      )}

      {!item.refunded && item.expert_status !== 'answered' && (
        <>
          <div className="answer-label">
            <img src="/assets/icon_bulb.png" alt="" />
            専門家・経験者から回答コメントが届くことがあります
          </div>
          <div className="muted">
            登録している専門家・経験者が内容を確認し、任意のタイミングでテキストの回答を追加してくれることがあります。回答が届いた場合、このページに表示されます。
          </div>
        </>
      )}

      {!item.refunded && item.expert_status === 'answered' && item.locked && (
        <>
          <div className="answer-label">
            <img src="/assets/icon_bulb.png" alt="" />
            {schoolAwareAnswerSectionLabel(item.question, item.experts?.credential, item.experts?.experienced_school_names)}
          </div>
          {/* 本文は見せないが、最初の1行だけ実際の文面を見せて「続きが気になる」
              感じを出す（2026-10-31、「ボカシは最初の1行だけみせるのどう？」との
              提案を受けて追加）。 */}
          {item.expert_answer_snippet && (
            <div className="qtext" style={{ whiteSpace: 'pre-wrap' }}>
              {item.expert_answer_snippet}
            </div>
          )}
          <div className="blur-lines">
            <div />
            <div />
            <div />
          </div>
          {EXPERT_VOLUNTEER_MODE ? (
            <>
              <div className="locked-note" style={{ fontWeight: 700 }}>
                この相談は回答済みです。今だけ、無料の会員登録だけで本文が読み放題になります（ベータ版・期間限定）。
              </div>
              <Link href="/account" className="btn-primary">
                無料で読み放題会員になる
              </Link>
            </>
          ) : (
            <>
              <div className="locked-note">
                この相談は回答済みですが、本文を読むには読み放題会員の登録が必要です。
              </div>
              <Link href="/account" className="btn-primary">
                読み放題会員になる
              </Link>
            </>
          )}
          {/* プロフィールカードは会員登録ボタンのあとに置く（2026-11-01、「プロフィールの
              位置は回答テキストのあとがよくない？」→「ぼかしのあとがいいよ」→「それが
              緑ボタンのあと」と3段階で調整した最終形）。 */}
          {item.experts && <AnswererMiniProfile experts={item.experts} />}
        </>
      )}

      {!item.refunded && item.expert_status === 'answered' && !item.locked && (
        <>
          <div className="answer-label">
            <img src="/assets/icon_bulb.png" alt="" />
            {item.experts
              ? `${item.experts.credential === SENPAI_CREDENTIAL ? '経験者' : item.experts.credential}・${item.experts.name}さんの回答`
              : '専門家の回答'}
          </div>
          <div className="qtext" style={{ whiteSpace: 'pre-wrap' }}>
            {item.expert_answer}
          </div>
          {/* プロフィールカードは回答テキストのあとに置く（2026-11-01、「プロフィールの
              位置は回答テキストのあとがよくない？」との指摘を受けて、本文より前だった
              配置から変更）。専門家は/experts/[id]、経験者は/senpai/[id]とページが
              分かれているため、credentialで出し分ける（AnswererMiniProfile内で判定）。 */}
          {item.experts && <AnswererMiniProfile experts={item.experts} />}
          {item.experts?.id && (
            <ConsultRequestButton
              expertId={item.experts.id}
              consultationId={item.id}
              onlineConsultUrl={item.experts.online_consult_url}
            />
          )}
          {/* 経験者の回答は、あくまで一個人の経験・感想であることを明示する免責
              （2026-10-31、「あくまで個人の感想であるっていう免責もかいておきたいね」
              「この保護者の回答のところに」との指摘を受けて追加）。 */}
          {item.experts?.credential === SENPAI_CREDENTIAL && (
            <div className="muted" style={{ fontSize: 12 }}>
              ※ あくまでこの方個人の経験・感想です。
            </div>
          )}

          {item.author_id === getUid() && (
            <div className="card-foot" style={{ marginTop: 4 }}>
              {item.expert_answer_helpful === undefined || item.expert_answer_helpful === null ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="muted" style={{ fontSize: 12 }}>この回答は参考になりましたか？</span>
                  <button
                    className="btn-secondary"
                    disabled={feedbackSending}
                    onClick={() => sendFeedback(true)}
                    style={{ padding: '4px 12px', fontSize: 12 }}
                  >
                    👍 参考になった
                  </button>
                  <button
                    className="btn-secondary"
                    disabled={feedbackSending}
                    onClick={() => sendFeedback(false)}
                    style={{ padding: '4px 12px', fontSize: 12 }}
                  >
                    👎 あまり
                  </button>
                </span>
              ) : (
                <span className="muted" style={{ fontSize: 12 }}>フィードバックありがとうございました。</span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
