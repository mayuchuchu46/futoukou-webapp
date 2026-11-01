import { NextRequest, NextResponse } from 'next/server';
import { getConsultationCounts } from '@/lib/consultations';

// カテゴリ別の件数。検索語（q）を渡すと、その検索語に絞り込んだ件数を返す
// （2026-11-01、qパラメータ対応。それまではサイト全体の件数固定だったため、
// ホーム画面で検索中でもチップの件数が検索語と無関係なままになっていた）。
// qを渡さない場合（/theme等）は今まで通りサイト全体の件数。
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  const { counts, total } = await getConsultationCounts({ q });
  return NextResponse.json({ counts, total });
}
