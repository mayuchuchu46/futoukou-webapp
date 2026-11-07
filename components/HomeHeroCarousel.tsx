'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export type HeroSlide = {
  id: string;
  href: string;
  src: string;
  alt: string;
};

const AUTOPLAY_MS = 5000;

/**
 * スマホのトップバナー（.home-cta）を自動スライドのカルーセルにしたもの
 * （2026-11-03、「バナーの箇所を自動スライドで3枚くらい動くようにして」との
 * 依頼を受けて追加）。単純な横スクロール＋transformのループ実装で、
 * 外部ライブラリは使わない。
 *
 * - 5秒ごとに自動で次のスライドへ（AUTOPLAY_MS）。
 * - ユーザーがドットをタップ／スワイプした場合は、そこから自動送りを再開する
 *   （止めっぱなしにはしない＝放置されたら気づかれないため）。
 * - スライドが1枚しか無い場合はドット・自動送りを出さず、これまで通り1枚だけ
 *   静的に表示する（将来スライドを減らしても壊れないように）。
 *
 * variant（2026-11-03追加）：スマホ用とPC用で、同じ仕組みを使い回しつつ
 * 表示/非表示の出し分け・見た目の微調整だけCSS側（app/globals.css）で変える
 * ための区別。PC（960px以上）では、以前は.home-hero-pc-linkという1枚固定の
 * 静的バナーだったが、「PCも同じようにカルーセルバナーにする」との依頼を受けて
 * こちらに統一した。
 *
 * 前後の矢印ボタン（2026-11-03追加）：スマホはスワイプで手動送りができるが、
 * PCにはその手段が無かったため、「PCも手動で次へ行けるようにしたい」との
 * 依頼を受けて追加。CSS側（.home-hero-carousel-arrow）でPC幅（960px以上）
 * だけに表示し、スマホではスワイプ・ドットのみのこれまでの見た目を保つ。
 */
export default function HomeHeroCarousel({
  slides,
  variant = 'mobile',
}: {
  slides: HeroSlide[];
  variant?: 'mobile' | 'pc';
}) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, index]);

  const goTo = (i: number) => {
    setIndex(((i % slides.length) + slides.length) % slides.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(diff) < 40) return; // 誤反応防止の最小スワイプ距離
    if (diff < 0) goTo(index + 1);
    else goTo(index - 1);
  };

  if (slides.length === 0) return null;

  return (
    <div
      className={`home-hero-carousel home-hero-carousel--${variant}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="home-hero-carousel-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <Link key={slide.id} href={slide.href} className="card home-cta home-hero-carousel-slide">
            {/* width/height属性（実画像の比率、CSS側はwidth:100%; height:autoのまま）を
                明示することで、画像読み込み前にブラウザが高さを確保できるようにし、
                CLS（レイアウトずれ）を防ぐ（2026-11-08、「SEO最優先で」との指摘を
                受けたCore Web Vitals対応の一環）。variant="mobile"はhome_hero_*系
                （1774×887＝比率2:1）、variant="pc"はhome_hero_pc_*系（約2172×724＝
                比率3:1）で統一されている。1枚目（LCP候補）だけ優先読み込みにし、
                以降は遅延読み込みにする。 */}
            <img
              src={slide.src}
              alt={slide.alt}
              className="home-cta-banner"
              width={variant === 'pc' ? 2172 : 1774}
              height={variant === 'pc' ? 724 : 887}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : undefined}
            />
          </Link>
        ))}
      </div>
      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="前のバナーを表示"
            className="home-hero-carousel-arrow home-hero-carousel-arrow--prev"
            onClick={() => goTo(index - 1)}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="次のバナーを表示"
            className="home-hero-carousel-arrow home-hero-carousel-arrow--next"
            onClick={() => goTo(index + 1)}
          >
            ›
          </button>
          <div className="home-hero-carousel-dots">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`バナー${i + 1}枚目を表示`}
                className={`home-hero-carousel-dot${i === index ? ' is-active' : ''}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
