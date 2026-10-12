'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CATS } from '@/lib/categories';
import { Consultation, metaLabel } from '@/lib/types';
import { getUid } from '@/lib/uid';
import { SEARCH_TAG_CANDIDATES } from '@/lib/searchTags';
import EyeIcon from './EyeIcon';

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
    (word) => item.question.includes(word) || (item.answer && item.answer.includes(word))
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

  const answerPreview = item.answer
    ? item.answer.slice(0, 90) + (item.answer.length > 90 ? '…' : '')
    : '';

  return (
    <Link href={`/result/${item.id}`} className="card">
      <div className="row">
        <div className={`cat-badge ${cat.cls}`}>{cat.label}</div>
        {metaLabel(item) && <span className="muted">{metaLabel(item)}</span>}
      </div>
      <div className="qtext qtext-main">💬 {item.question}</div>
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
              #{word}
            </button>
          ))}
        </div>
      )}
      {item.locked ? (
        <div className="card-answerbox">
          <div className="locked-badge">
            <img src="/assets/icon_lock.png" alt="" className="locked-badge-icon" />
            専門家の回答
          </div>
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
            <div className="qtext">{answerPreview}</div>
          </div>
        )
      )}
      <div className="card-foot">
        <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={toggleLike}>
          参考になった {likes}人
        </button>
        <span className="view-count"><EyeIcon /> {item.views || 0}</span>
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
