'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Consultation } from '@/lib/types';
import { getUid } from '@/lib/uid';
import { schoolAwareAnswerSectionLabel } from '@/lib/expertDisplay';
import { EXPERT_VOLUNTEER_MODE, SENPAI_CREDENTIAL } from '@/lib/config';

// 専門家・先輩保護者の回答がついた（またはつく予定の）相談の、AI回答の下に出す
// 追加セクション。
// 2026-11-01、専門家への質問を「AI回答に加えて、登録している専門家・先輩保護者が
// 任意で回答してくれる」という単一の相談に統合したのに伴い、Stripe決済確認まわり
// （session_id・confirming・!item.paid表示）を撤去した。新しい相談は登録と同時に
// 必ずpaid:trueになるため、決済待ち・未決済の状態は存在しない。
//
// サーバー側は「会員ではない匿名の訪問者」として見えるべき初期状態（initialItem）を
// すでにSSR済み。ここではマウント後に本当のviewer_id（本人／会員かどうか）で
// 再取得し、ロック解除が必要なら表示を差し替える。
// 回答した専門家・先輩保護者にとっては、回答すること自体が自分のプロフィールへの
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
            専門家・先輩保護者が回答します
          </div>
          <div className="muted">
            登録している専門家・先輩保護者が内容を確認し、テキストで回答します。回答が届くとこのページに表示されます。
          </div>
        </>
      )}

      {!item.refunded && item.expert_status === 'answered' && item.locked && (
        <>
          <div className="answer-label">
            <img src="/assets/icon_bulb.png" alt="" />
            {schoolAwareAnswerSectionLabel(item.question, item.experts?.credential, item.experts?.experienced_school_names)}
          </div>
          {/* 回答本文は読めなくても、誰が回答したか（プロフィール）はすぐ飛べるように、
              見出しの直後・本文より前に置く（2026-10-31、「誰が書いたかはプロフィール
              にすぐとばせるようにしたい」との依頼を受けて、ぼかし・会員登録導線より
              下にあった位置から移動）。 */}
          {item.experts?.id && (
            <Link
              href={item.experts.credential === SENPAI_CREDENTIAL ? `/senpai/${item.experts.id}` : `/experts/${item.experts.id}`}
              className="backlink"
              style={{ fontSize: 13, margin: 0 }}
            >
              {item.experts.name}さんのプロフィールを見る →
            </Link>
          )}
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
        </>
      )}

      {!item.refunded && item.expert_status === 'answered' && !item.locked && (
        <>
          <div className="answer-label">
            <img src="/assets/icon_bulb.png" alt="" />
            {item.experts ? `${item.experts.credential}・${item.experts.name}さんの回答` : '専門家の回答'}
          </div>
          {/* 誰が書いたかプロフィールへすぐ飛べるよう、本文より前に置く（2026-10-31、
              「誰が書いたかはプロフィールにすぐとばせるようにしたい」との依頼を受けて、
              本文の下にあった位置から移動）。専門家は/experts/[id]、先輩保護者は
              /senpai/[id]とページが分かれているため、credentialで出し分ける。 */}
          {item.experts?.id && (
            <Link
              href={item.experts.credential === SENPAI_CREDENTIAL ? `/senpai/${item.experts.id}` : `/experts/${item.experts.id}`}
              className="backlink"
              style={{ fontSize: 13, margin: 0 }}
            >
              {item.experts.name}さんのプロフィールを見る →
            </Link>
          )}
          <div className="qtext" style={{ whiteSpace: 'pre-wrap' }}>
            {item.expert_answer}
          </div>
          {item.experts?.id && (
            <ConsultRequestButton
              expertId={item.experts.id}
              consultationId={item.id}
              onlineConsultUrl={item.experts.online_consult_url}
            />
          )}
          {/* 先輩保護者の回答は、あくまで一個人の経験・感想であることを明示する免責
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
