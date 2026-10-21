'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { CATS } from '@/lib/categories';
import { getThemeDisplayLabel } from '@/lib/searchTags';

type TagCount = { word: string; count: number };

export default function ThemeClient() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [tags, setTags] = useState<TagCount[]>([]);

  useEffect(() => {
    fetch('/api/consultations/counts')
      .then((r) => r.json())
      .then((d) => setCounts(d.counts || {}))
      .catch(() => {});

    // テーマ（lib/searchTags.tsの候補ワード）別の件数。ホームのTagChipsが使っている
    // ものと同じAPIで、相談本文にその語を含むかどうかの件数を返す（2026-10-15追加、
    // 「カテゴリーだけじゃなく、テーマも対象にして」との指摘を受けて）。
    fetch('/api/consultations/tag-counts')
      .then((r) => r.json())
      .then((d) => setTags(d.tags || []))
      .catch(() => {});
  }, []);

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <h2 className="pagetitle">不登校お悩み辞典</h2>

          {/* カードの遷移先は、相談一覧（/?category=）ではなく「お悩み辞典」ページ
              （/dictionary/[category]）にした。実際の相談の集約＋AI解説文を先に見せ、
              そこから一覧へ進める導線の方が、テーマ選びの手がかりになる
              （2026-10-15、「ChatGPTと何が違うの」という課題への対策として追加）。 */}
          <div className="muted" style={{ fontSize: 13, fontWeight: 700, margin: '4px 0 -4px' }}>カテゴリから探す</div>
          {Object.entries(CATS).map(([key, c]) => (
            <Link key={key} href={`/dictionary/${key}`} className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--sub)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={c.icon} style={{ width: 20, height: 20 }} alt="" />
              </div>
              <div style={{ fontWeight: 700, flex: 1 }}>{c.label}</div>
              <div className="muted">{counts[key] || 0}件</div>
            </Link>
          ))}

          {/* 学びの多様化学校（旧：不登校特例校）の都道府県別一覧（/gakko）への導線
              （2026-10-18追加）。カテゴリ一覧の直後に置き、「進路・勉強」「学校との関係」を
              選ぼうとしている人の目に入りやすい位置にした。 */}
          <Link href="/gakko/matome" className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 4 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              🏫
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>学校・フリースクールを探す</div>
              <div className="muted" style={{ fontSize: 12 }}>都道府県別に学びの多様化学校（旧：不登校特例校）やフリースクールを調べられます</div>
            </div>
            <div className="muted">›</div>
          </Link>

          {/* テーマ（ADHD・起立性調節障害・いじめ…等）別の一覧。実際に投稿が集まっている
              語だけをtag-counts APIが返すので、該当件数が無いテーマは自然に出ない。 */}
          {tags.length > 0 && (
            <>
              <div className="muted" style={{ fontSize: 13, fontWeight: 700, margin: '14px 0 -4px' }}>テーマから探す</div>
              {tags.map(({ word, count }) => (
                <Link
                  key={word}
                  href={`/dictionary/theme/${encodeURIComponent(word)}`}
                  className="card"
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}
                >
                  {/* wordはtag-counts APIが返すcanonical word（例：不登校特例校）。
                      TagChips等と同じくgetThemeDisplayLabelで画面表示名だけ
                      置き換える（2026-10-20、/theme一覧にも同じ修正漏れがあった）。 */}
                  <div style={{ fontWeight: 700, flex: 1 }}>{getThemeDisplayLabel(word)}</div>
                  <div className="muted">{count}件</div>
                </Link>
              ))}
            </>
          )}
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
