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
