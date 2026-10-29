'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FeaturedGakko, FEATURED_GAKKO_TYPE_LABEL } from '@/lib/gakkoRankingTypes';

// ホーム画面「注目の学び場」ランキング（2026-10-29追加、「注目の学び場、みたいな感じで
// ランキング出すのどう？トップに」との要望を受けて新設）。
//
// 「よく読まれている相談」ランキング（HomeClient.tsx）と見た目・考え方を揃えるが、
// 学校・施設には閲覧数の記録が無いため、件数は「直近の相談でこの学校・施設名が
// 話題になった件数」（lib/gakkoRanking.ts）。閲覧数と誤解されないよう、EyeIconは使わず
// 「○件の相談で話題」というテキストで示す。
//
// 実データが3件（上位3位）に満たないうちはカード自体を出さない。架空の数値や
// 「まだ注目校がありません」のような空状態表示で無理に埋めない方針
// （「よく読まれている相談」がranking.length>=3で同じ扱いをしているのに合わせた）。
// 表示件数は「よく読まれている相談」と同じ3件固定（2026-10-29、「3位までにする？」との
// 指摘を受けて5件→3件に変更。API（lib/gakkoRanking.ts）側も上位3件だけ返すようにした）。
//
// 下に「もっと見る」リンクを追加（2026-10-29、「もっとみる、とかあったほうが
// いいのかな？学び場ページトップに誘導できるといいよね？」との指摘を受けて）。
// 当初は/gakko/matome（都道府県別の学校・フリースクール一覧）に飛ばしていたが、
// 「ランキングページもあるといいな」との追加要望を受けて、このランキングの続き
// （4位以降）をそのまま見られる専用ページ（app/gakko/ranking/page.tsx）を新設し、
// リンク先もそちらに変更した。
export default function FeaturedGakkoRanking() {
  const router = useRouter();
  const [items, setItems] = useState<FeaturedGakko[]>([]);

  useEffect(() => {
    fetch('/api/gakko-ranking')
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => {});
  }, []);

  if (items.length < 3) return null;

  return (
    <div className="ranking home-ranking">
      <div className="ranking-title">注目の学び場</div>
      <div className="rank-list">
        {items.map((item, i) => (
          <div
            key={item.key}
            className="rank-item"
            role="button"
            tabIndex={0}
            onClick={() => router.push(item.href)}
          >
            <span className="rank-num">{i + 1}</span>
            <span className="rank-q">
              {item.name}
              <span className="muted" style={{ fontSize: 11, marginLeft: 6 }}>
                {FEATURED_GAKKO_TYPE_LABEL[item.type]}
              </span>
            </span>
            <span className="rank-views">💬 {item.count}件の相談で話題</span>
          </div>
        ))}
      </div>
      <Link
        href="/gakko/ranking"
        className="muted"
        style={{ fontSize: 12, textDecoration: 'underline', display: 'inline-block', marginTop: 8 }}
      >
        もっと見る →
      </Link>
    </div>
  );
}
