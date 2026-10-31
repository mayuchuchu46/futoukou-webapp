'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CATS } from '@/lib/categories';
import { Consultation, metaLabel } from '@/lib/types';
import { getUid } from '@/lib/uid';
import { SEARCH_TAG_CANDIDATES, matchesThemeText, getThemeDisplayLabel } from '@/lib/searchTags';
import { relativeTimeLabel, isRecentPost } from '@/lib/relativeTime';
import { schoolAwareAnswerSectionLabel } from '@/lib/expertDisplay';
import EyeIcon from './EyeIcon';
import ReportButton from './ReportButton';
import ReactionIcons from './ReactionIcons';

export default function ConsultationCard({
  item,
  showDelete = false,
  onDeleted,
}: {
  item: Consultation;
  // マイページ（自分の投稿一覧）でだけtrueにして、削除ボタンを出す。
  // 「みんなの相談」はそのまま公開される仕様のため、誤投稿時の取り下げ手段として用意した。
  showDelete?: boolean;
  onDeleted?: (id: string) => void;
}) {
  const router = useRouter();
  const [likes, setLikes] = useState(item.likes);
  const [likedBy, setLikedBy] = useState<string[]>(item.liked_by || []);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const uid = typeof window !== 'undefined' ? getUid() : '';
  const liked = likedBy.includes(uid);
  const cat = CATS[item.category] || CATS.other;

  // このカードの質問・回答に、タグ候補語（lib/searchTags.ts）が含まれていれば
  // カード内に小さく表示し、タップで /search にその語で絞り込んで遷移する。
  const matchedTags = SEARCH_TAG_CANDIDATES.filter(
    (word) => matchesThemeText(item.question, word) || matchesThemeText(item.answer, word)
  ).slice(0, 4);

  function goToTag(e: React.MouseEvent, word: string) {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/?q=${encodeURIComponent(word)}`);
  }

  async function toggleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const nowLiked = !liked;
    setLikes((n) => n + (nowLiked ? 1 : -1));
    setLikedBy((list) => (nowLiked ? [...list, uid] : list.filter((u) => u !== uid)));
    await fetch('/api/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, uid, liked: nowLiked }),
    });
  }

  async function handleDeleteClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch('/api/consultations/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, author_id: uid }),
      });
      if (res.ok) {
        onDeleted?.(item.id);
      } else {
        setDeleting(false);
        setConfirmingDelete(false);
      }
    } catch {
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  function handleCancelDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setConfirmingDelete(false);
  }

  // 一覧カードでの回答の見せ方（2026-10-17変更）。以前は90文字で機械的に切っていたが、
  // AI回答の文字数上限自体を増やした（lib/prompt.ts参照）のに合わせて、文字数で切るのは
  // やめ、全文を表示したうえでCSSの行数クランプ（.qtext-clamp-3、約3行）で見た目を
  // 抑える方式に変更した（画面幅によらず自然に収まる）。
  const answerPreview = item.answer || '';

  // 投稿日時を絶対日付ではなく「3分前」のような相対表示にし、1時間以内の
  // 投稿にはNEWバッジを付ける（2026-10-15、一覧に「今動いている」感を
  // 出したいとの要望を受けて追加）。
  const timeLabel = item.created_at ? relativeTimeLabel(item.created_at) : '';
  const isNew = !!item.created_at && isRecentPost(item.created_at);

  return (
    <Link href={`/result/${item.id}`} className="card">
      <div className="row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className={`cat-badge ${cat.cls}`}>{cat.label}</div>
          {isNew && <span className="new-badge">NEW</span>}
        </div>
        <span className="muted card-time">
          {[metaLabel(item), timeLabel].filter(Boolean).join('・')}
        </span>
      </div>
      <div className="qtext qtext-main qtext-clamp-7">💬 {item.question}</div>
      {matchedTags.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {matchedTags.map((word) => (
            <button
              key={word}
              onClick={(e) => goToTag(e, word)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: 'var(--main)',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {/* 検索・遷移用のcanonical word（例：不登校特例校）と画面表示名
                  （学びの多様化学校）を分けるため、getThemeDisplayLabelを通す
                  （2026-10-19、「#不登校特例校というタグ、これは違うよね」との
                  指摘を受けて修正）。goToTagに渡すword自体はcanonicalのまま
                  （/?q=のクエリ・集計と合わせる必要があるため）。 */}
              #{getThemeDisplayLabel(word)}
            </button>
          ))}
        </div>
      )}
      {item.locked ? (
        <div className="card-answerbox">
          <div className="locked-badge">
            <img src="/assets/icon_lock.png" alt="" className="locked-badge-icon" />
            {schoolAwareAnswerSectionLabel(item.question, item.experts?.credential, item.experts?.experienced_school_names)}
          </div>
          {/* 最初の1行だけ実際の文面を見せる（2026-10-31、result/[id]/ResultClient.tsx
              と同じ対応）。 */}
          {item.expert_answer_snippet && (
            <div className="qtext qtext-clamp-3" style={{ fontSize: 13 }}>
              {item.expert_answer_snippet}
            </div>
          )}
          <div className="blur-lines">
            <div />
            <div />
            <div />
          </div>
        </div>
      ) : (
        answerPreview && (
          <div className="card-answerbox">
            <div className="answer-label">
              <img src="/assets/sensei_logo.png" alt="" />
              どうする先生（AI）
            </div>
            <div className="qtext qtext-clamp-3">{answerPreview}</div>
          </div>
        )
      )}
      <div className="card-foot">
        {/* 以前は「参考になった ◯人」とテキストで表示していたが、隣に絵文字＋件数
            だけの定型リアクション（下のReactionIcons）を追加したことで見た目が
            揃わなくなったため、こちらも👍＋件数だけの同じ見た目に統一した
            （2026-10-16、「参考になった、だけなんか表示違う」との指摘を受けて）。 */}
        <button className={`reaction-icon-btn ${liked ? 'active' : ''}`} onClick={toggleLike}>
          👍
          <span className="reaction-icon-count">{likes}</span>
        </button>
        {/* 定型リアクション（lib/reactions.ts）を、絵文字＋件数だけの省スペース版で
            一覧カードにも追加（2026-10-16、「トップにもその数表示されたりボタン
            押されるといい、絵文字だけでも」との指摘を受けて）。 */}
        <ReactionIcons
          id={item.id}
          initialReactions={item.reactions || {}}
          initialReactedBy={item.reacted_by || {}}
        />
        <span className="view-count"><EyeIcon /> {item.views || 0}</span>
        <ReportButton id={item.id} />
      </div>
      {showDelete && (
        <div className="card-foot" style={{ justifyContent: 'flex-end' }}>
          {confirmingDelete ? (
            <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span className="muted" style={{ fontSize: 12 }}>本当に削除しますか？</span>
              <button
                onClick={handleDeleteClick}
                disabled={deleting}
                style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, fontWeight: 700, color: '#C0392B', cursor: 'pointer' }}
              >
                {deleting ? '削除中…' : '🗑️ 削除する'}
              </button>
              <button
                onClick={handleCancelDelete}
                style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, color: 'var(--muted)', cursor: 'pointer' }}
              >
                キャンセル
              </button>
            </span>
          ) : (
            <button
              onClick={handleDeleteClick}
              style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, color: 'var(--muted)', cursor: 'pointer' }}
            >
              🗑️ この投稿を削除
            </button>
          )}
        </div>
      )}
    </Link>
  );
}
