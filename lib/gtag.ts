// GA4へのカスタムイベント送信用の小さなヘルパー。
//
// app/layout.tsxでgtag('config', ...)を読み込んでいる（NEXT_PUBLIC_GA_MEASUREMENT_ID未設定の
// 環境では読み込まれない）。拡張計測機能（Enhanced Measurement）のform_submitは、
// ページ内に実際の<form>要素がありsubmitイベントが発火した場合にしか計測されないため、
// <form>タグを使わずボタンのonClick+fetchで送信している箇所（例: /askの相談送信）では
// 自動計測の対象外になる。そうした「ボタン押下→fetch」型の重要な操作をコンバージョンとして
// 追う必要がある画面から呼び出す（2026-11-06追加）。
//
// window.gtagはapp/layout.tsxのインラインScriptで定義される（型定義が無いため
// windowを拡張してany経由で呼び出す）。GA_MEASUREMENT_ID未設定の環境やSSR中は
// window.gtag自体が存在しないため、呼び出し前に存在確認する。
export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag !== 'function') return;
  gtag('event', eventName, params);
}
