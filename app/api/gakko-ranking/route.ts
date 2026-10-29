import { NextResponse } from 'next/server';
import { getFeaturedGakkoRanking } from '@/lib/gakkoRanking';

// ホーム画面「注目の学び場」ランキング用API（2026-10-29追加）。キャッシュは
// lib/gakkoRanking.ts側（'use cache' + cacheLife）で行う（このNext.jsバージョンでは
// Route HandlerのrevalidateエクスポートはcacheComponents設定と併用できないため）。
export async function GET() {
  const items = await getFeaturedGakkoRanking(5);
  return NextResponse.json({ items });
}
