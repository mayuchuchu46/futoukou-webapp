import { NextRequest, NextResponse } from 'next/server';

// 外部サイトへのリンクを一度ここ経由にするための中継ルート。
//
// 今のところは素通しでリダイレクトするだけだが、将来アフィリエイトタグの付与や
// クリック計測（どの施設・サービスがよく見られているか）を追加するときに、
// 各ページの <a href> を書き換えずに済むようにしておくための下地。
// 2026-10-18時点では計測は未実装（idは受け取るだけで未使用）。
//
// 対象は商業サービス（オンラインフリースクール等）へのリンクのみ。学びの多様化学校・
// フリースクールの一覧（教育委員会等の公開データ）は中立な案内であることを優先し、
// このルートを経由させない方針。
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const to = searchParams.get('to');
  // id: 将来のクリック計測・アフィリエイトタグ付与のための識別子（現時点では未使用）
  // const id = searchParams.get('id');

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

  // TODO: クリック計測・アフィリエイトタグの付与をここに追加する
  return NextResponse.redirect(target.toString());
}
