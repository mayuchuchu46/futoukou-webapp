import { NextRequest, NextResponse, after } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// 外部サイトへのリンクを一度ここ経由にするための中継ルート。
//
// 今のところは素通しでリダイレクトするだけだが、将来アフィリエイトタグの付与や
// クリック計測（どの施設・サービスがよく見られているか）を追加するときに、
// 各ページの <a href> を書き換えずに済むようにしておくための下地。
// 2026-10-30：クリック計測を追加（outbound_clicksテーブル。supabase_schema.sql参照）。
// 記録は リンクid・遷移元(src)・遷移先ホスト・時刻 のみで、個人を特定しうる情報は保存しない。
// 計測の失敗はリダイレクトに影響させない。アフィリエイトタグの付与は未実装。
//
// 対象は商業サービス（オンラインフリースクール等）へのリンクのみ。学びの多様化学校・
// フリースクールの一覧（教育委員会等の公開データ）は中立な案内であることを優先し、
// このルートを経由させない方針。
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const to = searchParams.get('to');
  // id: リンクの識別子（例: tsushin-12）。src: 遷移元の画面（例: shindan）。
  // 想定外の値でテーブルを汚さないよう、英数字とハイフンのみ・32文字以内のものだけ記録する。
  const rawId = searchParams.get('id');
  const rawSrc = searchParams.get('src');
  const SAFE = /^[a-z0-9-]{1,32}$/;
  const linkId = rawId && SAFE.test(rawId) ? rawId : null;
  const src = rawSrc && SAFE.test(rawSrc) ? rawSrc : null;

  if (!to) {
    return NextResponse.redirect(new URL('/gakko', request.url));
  }

  let target: URL;
  try {
    target = new URL(to);
  } catch {
    return NextResponse.redirect(new URL('/gakko', request.url));
  }

  if (target.protocol !== 'https:') {
    return NextResponse.redirect(new URL('/gakko', request.url));
  }

  if (linkId) {
    after(async () => {
      try {
        await getSupabaseAdmin()
          .from('outbound_clicks')
          .insert({ link_id: linkId, src, target_host: target.hostname });
      } catch {
        // 計測失敗は無視（リダイレクト自体には影響しない）
      }
    });
  }

  // TODO: アフィリエイトタグの付与（ASP案件が確定してから）
  return NextResponse.redirect(target.toString());
}
