export function getUid(): string {
  if (typeof window === 'undefined') return 'server';
  let uid = localStorage.getItem('dsk_uid');
  if (!uid) {
    uid = 'u_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('dsk_uid', uid);
  }
  return uid;
}

export function hasAgreedTerms(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('dsk_terms_agreed') === '1';
}

export function setAgreedTerms() {
  if (typeof window === 'undefined') return;
  localStorage.setItem('dsk_terms_agreed', '1');
}

// 質問するページ（/ask）の入力中ドラフトの一時保存。離脱・タブを閉じて戻ってきても
// 書いた内容が残っているようにする（2026-10-12、新規ユーザーの離脱対策として追加）。
export type AskDraft = { category: string; text: string; grade: string; gender: string };
const ASK_DRAFT_KEY = 'dsk_ask_draft';

export function getAskDraft(): AskDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ASK_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AskDraft;
  } catch {
    return null;
  }
}

export function setAskDraft(draft: AskDraft) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ASK_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // localStorageが使えない環境では何もしない（ドラフト保存は無くても相談自体は可能）
  }
}

export function clearAskDraft() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ASK_DRAFT_KEY);
  } catch {
    // noop
  }
}
