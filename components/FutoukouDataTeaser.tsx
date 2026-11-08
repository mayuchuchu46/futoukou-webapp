import Link from 'next/link';
import { FUTOUKOU_LATEST } from '@/lib/data/futoukouStats';

// TOPページに出す「データで見る不登校」への誘導バナー（2026-11-08追加）。
// 「トップのどこから見れる？」との指摘を受けて追加——/data/futoukouへの導線は
// 当初Header（PC限定の.header-globalnav）とPcSidebar（PC限定）にしか置いておらず、
// モバイルからのTOP画面にはどこにも入り口が無かった（NewsTeaser.tsxと同じ失敗を
// 繰り返さないよう、見た目・配置をNewsTeaserに揃える）。
// NewsTeaser.tsxと同じ.expertbanner/.expertbanner-todayを流用し、新しいCSSは増やさない。
// HomeClient.tsxでNewsTeaserの直下に配置（PC・モバイル共通のhome-main-col内のため、
// PcSidebar側への重複配置は不要）。
export default function FutoukouDataTeaser() {
  return (
    <Link href="/data/futoukou" className="expertbanner expertbanner-today">
      <span className="expertbanner-icon" aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>📊</span>
      <div className="expertbanner-body">
        <div className="expertbanner-title">不登校児童生徒数、過去最多{FUTOUKOU_LATEST.total.toLocaleString()}人</div>
        <div className="expertbanner-desc">データで見る不登校（文部科学省調査より）</div>
      </div>
      <span className="expertbanner-cta">›</span>
    </Link>
  );
}
