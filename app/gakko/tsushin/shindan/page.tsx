import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { CORRESPONDENCE_HIGH_SCHOOLS, CORRESPONDENCE_HIGH_SCHOOL_AS_OF } from '@/lib/data/correspondenceHighSchools';
import ShindanClient, { type ShindanSchool } from './ShindanClient';

// 通信制高校の選択式診断（2026-10-30追加）。
// 地域・通う頻度・心のケア専門職の有無を選ぶと、条件に当てはまる学校を一覧する。
// 並び順はデータ上の確認状況だけで決め、広告・アフィリエイトの有無や報酬額は一切使わない。
// 入力内容はサーバーに送らず、ブラウザ内だけで絞り込む（個人情報を扱わない）。
export const instant = false;

const TITLE = '通信制高校 選択式診断';
const DESC = '住んでいる地域・通う頻度・心のケア専門職の有無を選ぶと、条件に合う通信制高校（広域）を確認できます。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESC,
  alternates: { canonical: `${SITE_URL}/gakko/tsushin/shindan` },
};

export default function ShindanPage() {
  const schools: ShindanSchool[] = CORRESPONDENCE_HIGH_SCHOOLS.map((s) => ({
    no: s.no,
    name: s.name,
    prefecture: s.prefecture,
    municipality: s.municipality,
    operator: s.operator,
    campusPrefectures: Array.from(new Set((s.campuses || []).map((c) => c.prefecture))),
    attendanceStyles: s.attendanceStyles || [],
    attendanceFlexible: !!s.attendanceFlexible,
    attendanceNote: s.attendanceNote || null,
    hasMentalCare: !!s.hasDedicatedMentalCareStaff,
  }));

  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <div style={{ margin: '14px 0' }}>
            <Link href="/gakko?type=tsushin" className="backlink">‹ 通信制高校トップへ</Link>
          </div>
          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>{TITLE}</div>
            <div className="qtext">{DESC}</div>
            <div className="muted" style={{ fontSize: 12 }}>
              選んだ内容はこの端末のブラウザ内だけで使い、サーバーには送りません。掲載データは{CORRESPONDENCE_HIGH_SCHOOL_AS_OF}の一覧をもとに、公式サイト等で確認できた情報を加えたものです。
            </div>
          </div>
          <ShindanClient schools={schools} />
          <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>この診断について</div>
            <div className="qtext" style={{ fontSize: 13 }}>
              学校の並び順は、選んだ条件が確認できているかどうかだけで決めています。学校からの掲載料や広告の有無は並び順に影響しません。一部の学校の公式サイトへのリンクは、将来、資料請求等で当サイトに紹介料が入る可能性があるリンク（広告を含む）です。
            </div>
            <div className="muted" style={{ fontSize: 12 }}>
              「確認できていない」は「その条件に当てはまらない」という意味ではありません。通う頻度や専門職の配置は、公式情報で確認できた学校だけに表示しています。学費・入学条件・最新のコース内容は、必ず各校の公式サイトでご確認ください。
            </div>
          </div>
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
