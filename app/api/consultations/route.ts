import { NextRequest, NextResponse } from 'next/server';
import { getConsultationsList } from '@/lib/consultations';

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category');
  const q = req.nextUrl.searchParams.get('q');
  const viewerId = req.nextUrl.searchParams.get('viewer_id');
  const authorId = req.nextUrl.searchParams.get('author_id');
  const expertAnswered = req.nextUrl.searchParams.get('expert_answered') === '1';

  const consultations = await getConsultationsList({ category, q, viewerId, authorId, expertAnswered });

  return NextResponse.json({ consultations });
}
