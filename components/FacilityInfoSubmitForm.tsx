'use client';

import { useState } from 'react';
import { FACILITY_FEATURE_OPTIONS, FACILITY_FEATURE_LABEL, type FacilityFeatureTag } from '@/lib/data/facilityFeatures';
import type { FacilityType } from '@/lib/facilityInfo';

// 施設・学校の費用・特徴タグをご本人（運営関係者・利用経験者）に提案してもらう
// フォーム（2026-11-07追加）。CoConの「この施設の運営者の方へ：掲載情報の修正」
// 導線と同じ役割。送信してもすぐには公開されず、運営の確認（/admin）を経て掲載される。
export default function FacilityInfoSubmitForm({
  facilityType,
  facilityNo,
  facilityName,
}: {
  facilityType: FacilityType;
  facilityNo: number;
  facilityName: string;
}) {
  const [open, setOpen] = useState(false);
  const [fee, setFee] = useState('');
  const [features, setFeatures] = useState<FacilityFeatureTag[]>([]);
  const [role, setRole] = useState<'staff' | 'parent'>('staff');
  const [contact, setContact] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  function toggleFeature(f: FacilityFeatureTag) {
    setFeatures((list) => (list.includes(f) ? list.filter((x) => x !== f) : [...list, f]));
  }

  async function submit() {
    if (!fee.trim() && features.length === 0) {
      setError('費用または特徴タグのいずれかを入力してください');
      return;
    }
    setError('');
    setSending(true);
    const res = await fetch('/api/facility-info/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        facility_type: facilityType,
        facility_no: facilityNo,
        facility_name: facilityName,
        fee: fee.trim() || null,
        features,
        submitter_role: role,
        submitter_contact: contact.trim() || null,
        note: note.trim() || null,
      }),
    });
    setSending(false);
    if (res.ok) {
      setDone(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || '送信に失敗しました');
    }
  }

  if (done) {
    return (
      <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
        <div className="qtext">
          ご提案ありがとうございました。運営が確認のうえ、このページに反映します。
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        className="muted"
        style={{ fontSize: 12, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        onClick={() => setOpen(true)}
      >
        この施設の費用・特徴の情報を提案する ›
      </button>
    );
  }

  return (
    <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
      <div className="answer-label" style={{ fontSize: 14 }}>施設の情報を提案する</div>
      <div className="qtext" style={{ fontSize: 12 }}>
        この施設の運営関係者・利用経験者の方からの情報提供用の入力欄です。運営が内容を確認のうえ掲載します。
      </div>

      <label className="muted" style={{ fontSize: 12, width: '100%', display: 'block' }}>
        費用（任意、例：月額20,000円〜）
        <input
          type="text"
          value={fee}
          onChange={(e) => setFee(e.target.value)}
          style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid var(--border)', boxSizing: 'border-box' }}
        />
      </label>

      <div className="muted" style={{ fontSize: 12, width: '100%' }}>
        特徴タグ（複数選択可）
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
          {FACILITY_FEATURE_OPTIONS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => toggleFeature(f)}
              style={{
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 999,
                border: '1px solid var(--border)',
                background: features.includes(f) ? 'var(--border)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              {FACILITY_FEATURE_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      <label className="muted" style={{ fontSize: 12, width: '100%', display: 'block' }}>
        ご自身の立場
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'staff' | 'parent')}
          style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid var(--border)', boxSizing: 'border-box' }}
        >
          <option value="staff">施設・学校の運営関係者</option>
          <option value="parent">利用者・保護者（利用経験者）</option>
        </select>
      </label>

      <label className="muted" style={{ fontSize: 12, width: '100%', display: 'block' }}>
        連絡先（任意。確認が必要な場合のみ運営が利用し、公開しません）
        <input
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid var(--border)', boxSizing: 'border-box' }}
        />
      </label>

      <label className="muted" style={{ fontSize: 12, width: '100%', display: 'block' }}>
        補足（任意）
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid var(--border)', boxSizing: 'border-box' }}
        />
      </label>

      {error && <div style={{ color: 'crimson', fontSize: 12 }}>{error}</div>}

      <button
        type="button"
        className="btn-primary"
        disabled={sending}
        onClick={submit}
        style={{ width: '100%' }}
      >
        {sending ? '送信中…' : '送信する'}
      </button>
    </div>
  );
}
