import Link from 'next/link';

// TOPページに出す「見守り力タイプ診断」への誘導バナー（2026-11-01追加）。
// 当初はNewsTeaser・TodayQuestionTeaserの回答済みバナーと同じ.expertbanner/
// .expertbanner-todayのテキストベースUIを流用していたが、同日中にChatGPTで
// 作成した画像バナー（public/assets/shindan/mimamori-top-banner.png）に差し替えた。
export default function MimamoriShindanTeaser() {
  return (
    <Link href="/shindan/mimamori" className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/shindan/mimamori-top-banner.png"
        alt="あなたの「見守り力」タイプ診断　全8問・今のあなたの対応スタイルを診断"
        width={1200}
        height={381}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
    </Link>
  );
}
