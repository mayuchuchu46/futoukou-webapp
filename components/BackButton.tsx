'use client';

import { useRouter } from 'next/navigation';

// /expertsのように、複数の文脈（/aboutからの通常の導線、/result/[id]の危機対応カードの
// 「専門家に相談する」等）から来る可能性があるページでは、「もどる」の行き先を固定の
// Linkにすると、実際に来た場所と違うページに飛んでしまう問題があった（2026-10-27、
// /result/[id]の危機対応カードから/expertsに来た人が、固定リンク先だった/aboutに
// 戻ってしまうという指摘を受けて追加）。そのため実際に直前にいた画面へ戻る
// router.back()を使う（Header.tsx・BottomNav.tsxの「戻る」と同じ考え方）。
export default function BackButton({ label = '← もどる' }: { label?: string }) {
  const router = useRouter();
  return (
    <button type="button" className="backlink" style={{ margin: '14px 0' }} onClick={() => router.back()}>
      {label}
    </button>
  );
}
