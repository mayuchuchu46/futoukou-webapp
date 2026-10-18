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
// child_idは子どもプロフィール機能（2026-10-16追加）で選んだ子ども。省略可能
// （undefinedの場合は未選択として扱う）にしておき、古い下書き（この項目が無い）を
// 復元してもエラーにならないようにしている。
// prefillText: 学校紹介ページ等から「相談する」ボタンで渡されたprefillクエリの値
// （2026-10-18追加）。draft.text===draft.prefillTextなら「まだ手を加えていない、
// ボタンから入っただけの状態」と判定できる。これが無いと、一度どこかの学校の
// prefillでdraftが保存された後、別の学校のボタンを押しても「下書きがある」と
// 判定されて古い学校名のまま上書きされない問題が起きる（「全部リリーベールのテキスト
// 入ってる」との報告を受けて修正）。
export type AskDraft = { category: string; text: string; grade: string; gender: string; child_id?: string; prefillText?: string };
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
