'use client';

import { useState } from 'react';

// 学校ページの口コミ一覧（FacilityReviews.tsx）の1件分。2026-11-07追加。
// 「口コミに名前が出ると知らなかった／ネガティブな内容を書いてしまったので直したい」
// という声を受けて、口コミを書いた本人が見たときだけ、その場で「編集する」ボタンを
// 出し、クリックすると本文がテキストエリアに変わって保存・削除ができるようにする。
// 自分の投稿かどうか（isOwner）はサーバー側（FacilityReviews.tsx）でログイン中の
// expert.idと照合済みのものを受け取るだけで、ここでは判定しない。
export default function ReviewItem({
  id,
  authorLabel,
  initialAuthorLabel,
  initialBody,
  isOwner,
}: {
  id: string;
  authorLabel: string;
  // 口コミ専用の表示名の生データ（空なら未設定＝プロフィールの表示名に
  // フォールバック中、という意味。2026-11-08追加）。編集欄の初期値に使う。
  initialAuthorLabel: string;
  initialBody: string;
  isOwner: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(initialBody);
  const [draft, setDraft] = useState(initialBody);
  const [label, setLabel] = useState(authorLabel);
  const [labelDraft, setLabelDraft] = useState(initialAuthorLabel);
  const [saving, setSaving] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function save() {
    if (!draft.trim()) return;
    setSaving(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/expert/public-review', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, body: draft, author_label: labelDraft }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || '保存に失敗しました。時間をおいて再度お試しください。');
        setSaving(false);
        return;
      }
      setBody(draft);
      setLabel(labelDraft.trim() || authorLabel);
      setEditing(false);
      setSaving(false);
    } catch {
      setErrorMessage('保存に失敗しました。時間をおいて再度お試しください。');
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm('この口コミを削除します。よろしいですか？')) return;
    setSaving(true);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/expert/public-review?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || '削除に失敗しました。時間をおいて再度お試しください。');
        setSaving(false);
        return;
      }
      setDeleted(true);
    } catch {
      setErrorMessage('削除に失敗しました。時間をおいて再度お試しください。');
      setSaving(false);
    }
  }

  if (deleted) return null;

  return (
    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="qtext" style={{ fontWeight: 700, fontSize: 13 }}>
          👤 {label}
        </div>
        {isOwner && !editing && (
          <button
            type="button"
            className="btn-ghost"
            style={{ fontSize: 12, padding: '2px 8px' }}
            onClick={() => {
              setDraft(body);
              setLabelDraft(initialAuthorLabel);
              setEditing(true);
            }}
          >
            編集する
          </button>
        )}
      </div>

      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
          {/* 口コミに表示する名前を、経験者プロフィールの名前とは別に設定できる
              欄（2026-11-08追加）。「学校名＋プロフィールの実名の組み合わせで
              子どもが特定される」との懸念を受けて、プロフィールとは切り離した
              ニックネームを口コミごとに設定できるようにした。 */}
          <input
            className="input"
            placeholder="この口コミに表示する名前（空ならプロフィールの表示名を使用）"
            value={labelDraft}
            onChange={(e) => setLabelDraft(e.target.value)}
          />
          <textarea
            className="input"
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          {errorMessage && (
            <div className="muted" style={{ color: '#C0392B', fontSize: 12 }}>
              {errorMessage}
            </div>
          )}
          <div className="row" style={{ gap: 8 }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: 13, padding: '6px 14px' }}
              disabled={saving || !draft.trim()}
              onClick={save}
            >
              {saving ? '保存中…' : '保存する'}
            </button>
            <button
              type="button"
              className="btn-ghost"
              style={{ fontSize: 13 }}
              disabled={saving}
              onClick={() => {
                setEditing(false);
                setErrorMessage('');
              }}
            >
              キャンセル
            </button>
            <button
              type="button"
              className="btn-ghost"
              style={{ fontSize: 13, color: '#C0392B', marginLeft: 'auto' }}
              disabled={saving}
              onClick={remove}
            >
              削除する
            </button>
          </div>
        </div>
      ) : (
        <div className="qtext" style={{ fontSize: 13, whiteSpace: 'pre-wrap', marginTop: 4 }}>
          {body}
        </div>
      )}
    </div>
  );
}
