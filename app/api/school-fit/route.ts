import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentMember } from '@/lib/memberAuth';
import { getOrGenerateMemberSchoolFit, getOrGenerateChildSchoolFit, fitProgressLabel } from '@/lib/schoolFit';
import { MANABI_TAYOUKA_GAKKO } from '@/lib/data/manabiTayoukaGakko';

// 学校ごとの「相性メモ」エンドポイント（2026-10-22追加）。学校詳細ページ
// （/gakko/school/[no]）から、ログイン中の会員かどうかに関わらず常に叩かれるが、
// 会員判定（getCurrentMember）はCookie依存のため、動的なRoute Handlerとしてここで
// 行う（サーバーコンポーネント側で直接行うとCDNの共有キャッシュに特定ユーザー向けの
// 表示が乗ってしまう危険があるため。lib/consultations.tsのコメント参照）。
//
// /api/member-summaryと同じ方針：?child_id=があればその子ども単位、無ければ会員単位
// （アカウント全体）の相談履歴から相性メモを生成する。child_idは必ずログイン中の会員
// 本人のものであることを確認する。
export async function GET(req: NextRequest) {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json({ loggedIn: false, count: 0, note: null });
  }

  const schoolNoParam = req.nextUrl.searchParams.get('school_no');
  const schoolNo = schoolNoParam ? Number(schoolNoParam) : NaN;
  const school = Number.isInteger(schoolNo) ? MANABI_TAYOUKA_GAKKO.find((s) => s.no === schoolNo) : null;
  if (!school) {
    return NextResponse.json({ error: '学校が見つかりませんでした' }, { status: 404 });
  }

  const childId = req.nextUrl.searchParams.get('child_id');

  let result;
  if (childId) {
    const supabase = getSupabaseAdmin();
    const { data: child } = await supabase
      .from('children')
      .select('id')
      .eq('id', childId)
      .eq('member_id', member.id)
      .single();
    if (!child) {
      return NextResponse.json({ error: 'お子さんが見つかりませんでした' }, { status: 404 });
    }
    result = await getOrGenerateChildSchoolFit(childId, school);
  } else {
    result = await getOrGenerateMemberSchoolFit(member.id, school);
  }

  if (!result) {
    return NextResponse.json({ loggedIn: true, count: 0, note: null });
  }

  return NextResponse.json({
    loggedIn: true,
    count: result.consultationCount,
    note: {
      fitNote: result.fitNote,
      progressLabel: fitProgressLabel(result.consultationCount),
    },
  });
}
