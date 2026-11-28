import type { Metadata } from 'next';
import Link from 'next/link';
import { cacheLife } from 'next/cache';
import { SITE_URL } from '@/lib/site';

// 「子どもとの関わり方3ヶ月実践プログラム」申込みLP（どうする先生×てつなぎ共催、
// 田村さん担当の3ヶ月間プログラム）。プログラム名は2026-11-28に
// 「子どもとの関わり方実践プログラム」から変更。
// 元はClaude Artifact上でデザインしたページを移植したもの。独自のデザインシステム
// （色・フォント・コンポーネント）を持つため、サイト共通のapp-shell/Header/Footerは
// 使わず、.oyako-lpスコープ内に閉じたスタイルで独立したページとして実装している
// （2026-11-24）。
//
// 画像（写真・イラストアイコン、計30点）はArtifact内のアセットストレージから
// 取得し、public/images/oyako-program/ 配下にそのまま保存している（2026-11-25）。
// てつなぎ関連記事カルーセル（.tetsunagi-auto-scroll）用の自動スクロールJSも
// そのまま移植済み。
//
// 価格・お支払い方法は企画の進行に合わせて今後も変わりうる。
// 開催日程は2026-11-28に確定：2027年2月・3月・4月の第2・第4日曜日
// （2/14, 2/28, 3/14, 3/28, 4/11, 4/25）、各回21:00〜（Projectのareaファイル参照）。
// 早期割引（2026-11-28確定）：2026年12月31日までの申込みで¥3,000引き（¥66,800）。
// 申込締切は2027年1月31日、最少催行人数は4名（先着順、定員6名）。
//
// 特定商取引法に基づく表記：サイト共通の/tokushohoページは、サイト本体の有料機能
// （読み放題会員・専門家への質問）がまだベータ公開中で価格未定である旨の内容になっており、
// このプログラムの実際の価格（¥69,800）とは前提が異なる。そのためこのページでは
// /tokushohoにはリンクせず、このプログラム専用の特定商取引法表記をページ内に
// 自己完結する形で持たせている（2026-11-24）。

export const metadata: Metadata = {
  title: `公認心理師が伴走する、子どもとの関わり方3ヶ月実践プログラム | どうする先生`,
  description: `不登校・行き渋り・発達特性など、子どもとの関わり方に迷う保護者向けの3ヶ月間プログラム。現役スクールカウンセラーである公認心理師が、ワークショップ・個別カウンセリング・オンラインコミュニティで実践的に伴走します。`,
  alternates: { canonical: `${SITE_URL}/oyako-program` },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    title: `公認心理師が伴走する、子どもとの関わり方3ヶ月実践プログラム`,
    description: `不登校・行き渋り・発達特性など、子どもとの関わり方に迷う保護者向けの3ヶ月間プログラム。現役スクールカウンセラーである公認心理師が、ワークショップ・個別カウンセリング・オンラインコミュニティで実践的に伴走します。`,
  },
  twitter: {
    card: 'summary_large_image',
    title: `公認心理師が伴走する、子どもとの関わり方3ヶ月実践プログラム`,
    description: `不登校・行き渋り・発達特性など、子どもとの関わり方に迷う保護者向けの3ヶ月間プログラム。現役スクールカウンセラーである公認心理師が実践的に伴走します。`,
  },
};

const FAQ_JSONLD = `{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "発達の診断を受けていなくても参加できますか？", "acceptedAnswer": {"@type": "Answer", "text": "はい、診断の有無は問いません。発達特性があるかどうかにかかわらず、ご参加いただけます。"}}, {"@type": "Question", "name": "不登校ではなく、行き渋り程度でも対象になりますか？", "acceptedAnswer": {"@type": "Answer", "text": "はい。不登校に限らず、お子さんとの関わり方に迷いや不安がある方であれば対象です。"}}, {"@type": "Question", "name": "対象は小学生〜高校生くらいとなっていますが、未就学児でも参加できますか？", "acceptedAnswer": {"@type": "Answer", "text": "対象の目安は小学生〜高校生くらいのお子さんですが、未就学児の方でもご希望があればご相談ください。"}}, {"@type": "Question", "name": "医療的な相談や診断もしてもらえますか？", "acceptedAnswer": {"@type": "Answer", "text": "本プログラムは診断や治療を行うものではありません。気づきと、必要に応じた相談先のご案内に範囲を限ります。"}}, {"@type": "Question", "name": "途中でやめることはできますか？キャンセルの場合、返金はありますか？", "acceptedAnswer": {"@type": "Answer", "text": "ご都合によるお取消・ご退会については、原則として返金はいたしかねます。なお、最少催行人数（4名）に満たず開催自体を中止する場合は、全額返金いたします。"}}, {"@type": "Question", "name": "欠席した場合、アーカイブ（録画）はありますか？", "acceptedAnswer": {"@type": "Answer", "text": "グループワークでは参加者同士の個人的なお話もうかがうため、全体の録画はおこなっておりません。欠席された回については、公認心理師による専門的な解説部分のみを録画し、後日共有いたします。"}}, {"@type": "Question", "name": "個人情報やLINEでのやり取りの扱いについて教えてください。", "acceptedAnswer": {"@type": "Answer", "text": "ご登録いただいた情報やオンラインコミュニティでの投稿内容は、本プログラムの運営以外の目的には使用しません。"}}, {"@type": "Question", "name": "夫婦で参加することはできますか？", "acceptedAnswer": {"@type": "Answer", "text": "はい。おひとり分のお申し込みで、ご夫婦お二人でご参加いただけます。お二人目は半額（¥34,900）です。個別カウンセリング（オンライン）は1回45分、お二人そろって同じ画面でご参加いただく形です（アカウントは1つ）。オンラインコミュニティなどのコミュニティは、お二人それぞれのアカウントでご参加いただけます。"}}]}`;
const COURSE_JSONLD = `{"@context": "https://schema.org", "@type": "Course", "name": "子どもとの関わり方3ヶ月実践プログラム", "description": "不登校・行き渋り・発達特性など、子どもとの関わり方に迷う保護者向けに、公認心理師が伴走する3ヶ月間の実践型プログラム（全六回のワークショップ、月一回の個別カウンセリング、オンラインコミュニティ付き）。", "inLanguage": "ja", "timeRequired": "P3M", "hasCourseInstance": {"@type": "CourseInstance", "courseMode": "online", "courseWorkload": "P1M2S"}, "offers": {"@type": "Offer", "price": "69800", "priceCurrency": "JPY", "availability": "https://schema.org/InStock"}}`;

const PAGE_STYLE = `.oyako-lp{
    --cream:#F7FAFA;
    --peach-light:#E6F4F3;
    --peach:#E6F4F3;
    --card:#FFFFFF;
    --ink:#333638;
    --ink-soft:#4D5355;
    --mute:#8FA3A5;
    --coral:#00A9B8;
    --coral-dark:#00838F;
    --sage:#DE8A6E;
    --sage-dark:#B26E58;
    --sage-bg:#F8E8E2;
    --gold:#C9A227;
    --gold-bg:#FFF6CC;
  }.oyako-lp{margin:0;font-family:'Work Sans',system-ui,sans-serif;background:var(--cream);color:var(--ink)}.oyako-lp h1, .oyako-lp h2, .oyako-lp h3{font-family:'Fraunces',Georgia,serif;margin:0;letter-spacing:-0.01em}.oyako-lp a{color:var(--coral);text-decoration:none}.oyako-lp a:hover{color:var(--coral-dark)}.oyako-lp .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;background:var(--sage);color:#FFFDF9;padding:16px 32px;border-radius:999px;font-weight:600;font-size:17px;border:none;cursor:pointer;box-shadow:0 4px 14px rgba(222,138,110,0.3)}.oyako-lp .btn:hover{background:var(--sage-dark)}.oyako-lp .btn-outline{display:inline-flex;align-items:center;justify-content:center;background:transparent;color:var(--ink);padding:14px 30px;border-radius:999px;font-weight:600;font-size:16px;border:1.5px solid var(--ink);cursor:pointer}.oyako-lp .icon-badge{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:0 0 52px}.oyako-lp .pill{display:flex;align-items:center;gap:10px;background:var(--card);border-radius:999px;padding:10px 18px 10px 10px;font-size:13px;font-weight:600;color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,0.05)}.oyako-lp .pill .mini-icon{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:0 0 30px}.oyako-lp details>summary{cursor:pointer;list-style:none}.oyako-lp details>summary::-webkit-details-marker{display:none}.oyako-lp details .chev{transition:transform 0.2s;flex:0 0 auto}.oyako-lp details[open] .chev{transform:rotate(180deg)}.oyako-lp nav a{color:var(--ink-soft);font-weight:500}.oyako-lp nav a:hover{color:var(--coral)}.oyako-lp .hero-photo{object-position:center 30%}
  @media (max-width:640px){.oyako-lp .hero-section{min-height:auto !important;padding:40px 24px 56px !important}.oyako-lp .hero-photo{object-position:70% 6% !important}.oyako-lp .hero-gradient-h{background:linear-gradient(100deg,var(--cream) 0%,var(--cream) 30%,rgba(247,250,250,0.9) 46%,rgba(247,250,250,0.55) 62%,rgba(247,250,250,0.18) 78%) !important}.oyako-lp .hero-mobile-scrim{display:none !important}.oyako-lp .hero-desc{max-width:68% !important}.oyako-lp .hero-pills-row .pill{font-size:11px !important;padding:9px 10px !important;white-space:nowrap;justify-content:center}.oyako-lp .hero-pills-row .pill .mini-icon{display:none !important}}
  @keyframes slideInFade{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}.oyako-lp .slide-in{animation:slideInFade linear;animation-timeline:view();animation-range:entry 0% entry 50%}
  @supports not (animation-timeline:view()){.oyako-lp .slide-in{opacity:1;transform:none}}
  @media (max-width:640px){.oyako-lp .instructor-wrap{flex-direction:column !important;align-items:center !important;gap:16px !important}.oyako-lp .instructor-left{gap:12px !important;width:100% !important}.oyako-lp .instructor-photo-col{align-items:center !important;margin-bottom:0 !important}.oyako-lp .instructor-text-col{align-items:center !important;text-align:center !important;min-width:0 !important;gap:6px !important}.oyako-lp .diff-card{flex-direction:row !important;align-items:flex-start !important;gap:14px !important}.oyako-lp .diff-icon{flex:0 0 auto !important}.oyako-lp .flow-wrap{flex-direction:column !important;align-items:stretch !important;gap:6px !important}.oyako-lp .flow-step{flex-direction:row !important;justify-content:flex-start !important;gap:10px !important;max-width:100% !important;text-align:left !important;flex:0 0 auto !important;width:100% !important}.oyako-lp .flow-arrow{transform:rotate(90deg);align-self:flex-start;padding-left:13px}}
  @media (min-width:641px){.oyako-lp .goal-icon-wrap{width:96px !important;height:96px !important}.oyako-lp .goal-icon{width:96px !important;height:96px !important}.oyako-lp .goal-badge{width:32px !important;height:32px !important}.oyako-lp .instructor-left{position:sticky;top:24px}.oyako-lp .schedule-grid{grid-template-columns:repeat(3, minmax(140px,1fr)) !important}}`;

const PAGE_BODY = `<div id="top" style="width:100%;max-width:100%;overflow-x:hidden">

  <!-- HERO -->
  <section class="hero-section" style="position:relative;overflow:hidden;min-height:560px;display:flex;align-items:center;padding:64px 24px 80px">
    <img src="/images/oyako-program/d958e240cd492914484b48b7ffef597d.png" alt="親子" class="hero-photo" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0">
    <div class="hero-gradient-h" style="position:absolute;inset:0;z-index:0;background:linear-gradient(100deg,var(--cream) 0%,var(--cream) 34%,rgba(247,250,250,0.94) 48%,rgba(247,250,250,0.55) 62%,rgba(247,250,250,0.15) 76%);"></div>
    <div class="hero-gradient-v" style="position:absolute;inset:0;z-index:0;background:linear-gradient(0deg,var(--peach) 0%,rgba(243,233,220,0) 22%);"></div>
    <div class="hero-mobile-scrim" style="position:absolute;inset:0;z-index:0;background:rgba(251,246,239,0.4);display:none"></div>
    <div class="hero-content" style="max-width:1120px;margin:0 auto;width:100%;position:relative;z-index:1">
      <div class="hero-text-panel" style="flex:1 1 440px;display:flex;flex-direction:column;gap:20px;max-width:560px">
        <div style="display:inline-flex;align-items:center;flex-wrap:wrap;gap:6px;font-size:12px;font-weight:700;letter-spacing:0.04em;color:var(--coral-dark);background:#DFF3F4;padding:6px 14px;border-radius:999px;width:fit-content"><span>全6回・3ヶ月コース</span><span style="color:var(--coral-dark);opacity:0.5;font-weight:400">｜</span><span>個別カウンセリング付</span></div>
        <h1 style="line-height:1.15;color:var(--ink)"><span style="display:block;font-size:clamp(13px,3.2vw,16px);font-weight:600;color:var(--coral-dark);letter-spacing:0.02em;margin-bottom:10px;font-family:'Work Sans',system-ui,sans-serif">公認心理師が伴走する</span><span style="display:block;font-size:clamp(28px,8.5vw,54px);font-weight:800;letter-spacing:-0.01em">子どもとの関わり方</span><span style="display:inline-block;font-size:clamp(28px,8.5vw,54px);font-weight:800;letter-spacing:-0.01em;color:var(--coral);border-bottom:6px solid #FFD900;padding-bottom:2px;margin-top:4px"><span style="font-family:'Hiragino Mincho ProN','Yu Mincho',YuMincho,serif">3</span>ヶ月実践プログラム</span></h1>
        <p class="hero-desc" style="font-size:clamp(15px,4vw,17px);line-height:1.8;color:var(--ink-soft);margin:0;max-width:520px">不登校や発達面の心配、行き渋りなど、お子さんとの関わり方に迷いや不安があるご家庭へ。<strong style="color:var(--ink)">3ヶ月間、公認心理師と一緒に実践できる関わり方を身につけます。</strong></p>
        <div class="hero-pills-row" style="display:flex;gap:8px">
          <div class="pill" style="flex:1 1 0;min-width:0;padding:8px 10px 8px 8px">
            <span class="mini-icon" style="background:#DFF3F4;flex:0 0 30px"><img src="/images/oyako-program/66d392c36711cc29a556d2ce65bbc4d2.png" alt="" style="width:20px;height:20px;object-fit:contain"></span>
            グループワーク
          </div>
          <div class="pill" style="flex:1 1 0;min-width:0;padding:8px 10px 8px 8px">
            <span class="mini-icon" style="background:var(--gold-bg);flex:0 0 30px"><img src="/images/oyako-program/1f9984e3f8e0e0c6de51d9efc411a443.png" alt="" style="width:20px;height:20px;object-fit:contain"></span>
            カウンセリング
          </div>
          <div class="pill" style="flex:1 1 0;min-width:0;padding:8px 10px 8px 8px">
            <span class="mini-icon" style="background:var(--sage-bg);flex:0 0 30px"><img src="/images/oyako-program/81497ab9a33ed1c2373dd660ace63926.png" alt="" style="width:20px;height:20px;object-fit:contain"></span>
            コミュニティ
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:var(--coral-dark)">
          <svg width="14" height="14" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          <span>全６回・３ヶ月コース</span><span style="color:var(--mute);font-weight:400">｜</span><span>個別相談（月１回）付き</span>
        </div>
        <div>
          <a href="#apply" class="btn" style="font-size:18px;padding:18px 36px;box-shadow:0 6px 20px rgba(222,138,110,0.4)">お申し込みはこちら →</a>
        </div>
        <div style="font-size:13px;color:var(--mute)">3ヶ月コース・定員先着６名｜2027年2月14日開講。新学年を控える時期だからこそ、関わり方を整えておきたい。</div>
      </div>
    </div>
    <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style="display:block;width:100%;height:40px;position:absolute;left:0;bottom:-1px">
      <path d="M0,30 C360,70 1080,-10 1440,30 L1440,60 L0,60 Z" fill="var(--cream)"></path>
    </svg>
  </section>

  <!-- GOALS -->
  <section style="padding:64px 24px 56px;max-width:860px;margin:0 auto;text-align:center;display:flex;flex-direction:column;gap:28px;position:relative">
    <img src="/images/oyako-program/4bf347b0d99f50a5ae1cb6ed0155d282.png" alt="" style="position:absolute;top:-10px;right:0;width:90px;height:90px;object-fit:contain;opacity:0.5;pointer-events:none">
    <div>
      <h2 style="font-size:clamp(21px,5.5vw,26px);color:var(--ink)">このプログラムで目指すこと</h2>
      <p style="font-size:15px;color:var(--ink-soft);margin:12px 0 0">3ヶ月後には、お子さんの言動の背景を理解し、落ち着いて関わり方を選べる状態を目指します。</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(min(220px, 100%), 1fr));gap:18px">
      <div style="background:var(--card);border-radius:14px;padding:22px 20px;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.04)">
        <div class="goal-icon-wrap" style="position:relative;width:68px;height:68px;margin-bottom:4px">
          <img class="goal-icon" src="/images/oyako-program/243707ff1e003ac3b8350d577eefd88d.png" alt="" style="width:68px;height:68px;border-radius:50%;object-fit:cover;object-position:center 40%">
          <div class="goal-badge" style="position:absolute;bottom:-4px;right:-4px;width:24px;height:24px;border-radius:50%;background:var(--sage-bg);color:var(--sage);display:flex;align-items:center;justify-content:center;border:2px solid var(--card)"><svg width="12" height="12" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></svg></div>
        </div>
        <div style="font-size:15px;font-weight:600;color:var(--ink);line-height:1.6">子どもとの関わり方に自信が持てる</div>
      </div>
      <div style="background:var(--card);border-radius:14px;padding:22px 20px;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.04)">
        <div class="goal-icon-wrap" style="position:relative;width:68px;height:68px;margin-bottom:4px">
          <img class="goal-icon" src="/images/oyako-program/7f8472ed14f6555145f28320e141160b.png" alt="" style="width:68px;height:68px;border-radius:50%;object-fit:cover;object-position:center 40%">
          <div class="goal-badge" style="position:absolute;bottom:-4px;right:-4px;width:24px;height:24px;border-radius:50%;background:var(--sage-bg);color:var(--sage);display:flex;align-items:center;justify-content:center;border:2px solid var(--card)"><svg width="12" height="12" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></svg></div>
        </div>
        <div style="font-size:15px;font-weight:600;color:var(--ink);line-height:1.6">一人で抱え込まず相談できる場ができる</div>
      </div>
      <div style="background:var(--card);border-radius:14px;padding:22px 20px;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.04)">
        <div class="goal-icon-wrap" style="position:relative;width:68px;height:68px;margin-bottom:4px">
          <img class="goal-icon" src="/images/oyako-program/6e7956d6ce55ed774e0ac0be4f6c2ce4.png" alt="" style="width:68px;height:68px;border-radius:50%;object-fit:cover;object-position:center 40%">
          <div class="goal-badge" style="position:absolute;bottom:-4px;right:-4px;width:24px;height:24px;border-radius:50%;background:var(--sage-bg);color:var(--sage);display:flex;align-items:center;justify-content:center;border:2px solid var(--card)"><svg width="12" height="12" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></svg></div>
        </div>
        <div style="font-size:15px;font-weight:600;color:var(--ink);line-height:1.6">不安な気持ちが少しずつ軽くなる</div>
      </div>
    </div>
  </section>

  <!-- PAIN POINTS -->
  <section style="padding:56px 24px 72px;max-width:820px;margin:0 auto;display:flex;flex-direction:column;gap:28px;text-align:center">
    <h2 style="font-size:clamp(22px,6vw,28px);color:var(--ink)">こんなお悩み、ありませんか？</h2>
    <div style="display:flex;flex-direction:column;gap:16px;text-align:left;margin-top:8px">
      <div style="display:flex;align-items:stretch;background:var(--card);border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04)">
        <img src="/images/oyako-program/c3c23bca86b2aa4414e285bca2e106fb.png" alt="" style="width:120px;flex:0 0 120px;object-fit:cover">
        <div style="width:1px;background:#EFE6D8;flex:0 0 1px"></div>
        <div style="display:flex;gap:10px;align-items:flex-start;padding:18px 20px;flex:1">
          <span style="flex:0 0 24px;width:24px;height:24px;border-radius:8px;background:#DFF3F4;color:var(--coral);display:flex;align-items:center;justify-content:center;margin-top:2px"><svg width="14" height="14" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>
          <div style="font-size:15px;font-weight:600;color:var(--ink);line-height:1.6">子どもにどう声をかけたらいいか、関わり方に迷っている（不登校・行き渋りも含め）</div>
        </div>
      </div>
      <div style="display:flex;align-items:stretch;background:var(--card);border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04)">
        <img src="/images/oyako-program/5244f88952ac720365ef7d5df4362a26.png" alt="" style="width:120px;flex:0 0 120px;object-fit:cover">
        <div style="width:1px;background:#EFE6D8;flex:0 0 1px"></div>
        <div style="display:flex;gap:10px;align-items:flex-start;padding:18px 20px;flex:1">
          <span style="flex:0 0 24px;width:24px;height:24px;border-radius:8px;background:#DFF3F4;color:var(--coral);display:flex;align-items:center;justify-content:center;margin-top:2px"><svg width="14" height="14" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>
          <div style="font-size:15px;font-weight:600;color:var(--ink);line-height:1.6">子どもの様子の変化が、ただの反抗期なのか注意すべきサインなのか分からない</div>
        </div>
      </div>
      <div style="display:flex;align-items:stretch;background:var(--card);border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04)">
        <img src="/images/oyako-program/dd5c7278b156792d6d13b637637ccd3b.png" alt="" style="width:120px;flex:0 0 120px;object-fit:cover">
        <div style="width:1px;background:#EFE6D8;flex:0 0 1px"></div>
        <div style="display:flex;gap:10px;align-items:flex-start;padding:18px 20px;flex:1">
          <span style="flex:0 0 24px;width:24px;height:24px;border-radius:8px;background:#DFF3F4;color:var(--coral);display:flex;align-items:center;justify-content:center;margin-top:2px"><svg width="14" height="14" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>
          <div style="font-size:15px;font-weight:600;color:var(--ink);line-height:1.6">自分の対応が合っているのか、専門家に相談できる場がない</div>
        </div>
      </div>
    </div>
  </section>

  <!-- WHO IT'S FOR -->
  <section style="padding:0 24px 72px;max-width:820px;margin:0 auto">
    <h2 style="font-size:24px;color:var(--ink);text-align:center;margin-bottom:8px">こんなご家庭に</h2>
    <p style="font-size:13px;color:var(--mute);text-align:center;margin:0 0 24px">対象：小学生～高校生くらいのお子さんを持つ保護者（目安）</p>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;align-items:center;gap:12px;background:var(--peach);border-radius:10px;padding:14px 18px">
        <span style="flex:0 0 26px;width:26px;height:26px;border-radius:50%;background:var(--card);color:var(--coral);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>
        <div style="font-size:15px;color:var(--ink);line-height:1.5">不登校、または学校への行き渋りがある</div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;background:var(--peach);border-radius:10px;padding:14px 18px">
        <span style="flex:0 0 26px;width:26px;height:26px;border-radius:50%;background:var(--card);color:var(--coral);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>
        <div style="font-size:15px;color:var(--ink);line-height:1.5">発達特性（診断の有無は問わず）があり、関わり方に悩んでいる</div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;background:var(--peach);border-radius:10px;padding:14px 18px">
        <span style="flex:0 0 26px;width:26px;height:26px;border-radius:50%;background:var(--card);color:var(--coral);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>
        <div style="font-size:15px;color:var(--ink);line-height:1.5">反抗や拒否が強く、どう距離を取ればいいかわからない</div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;background:var(--peach);border-radius:10px;padding:14px 18px">
        <span style="flex:0 0 26px;width:26px;height:26px;border-radius:50%;background:var(--card);color:var(--coral);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>
        <div style="font-size:15px;color:var(--ink);line-height:1.5">精神的な不調のサインが心配だが、どこに相談すればいいかわからない</div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;background:var(--peach);border-radius:10px;padding:14px 18px">
        <span style="flex:0 0 26px;width:26px;height:26px;border-radius:50%;background:var(--card);color:var(--coral);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>
        <div style="font-size:15px;color:var(--ink);line-height:1.5">生活リズムが崩れていて、次の一歩をどう後押しすればいいか迷っている</div>
      </div>
    </div>
  </section>

  <!-- PROGRAM CONTENT -->
  <section id="program-content" style="background:var(--peach);padding:72px 24px;position:relative">
    <div style="max-width:1000px;margin:0 auto;display:flex;flex-direction:column;gap:40px">
      <div style="text-align:center;display:flex;flex-direction:column;gap:12px">
        <h2 style="font-size:clamp(22px,6vw,28px);color:var(--ink)">プログラム内容</h2>
        <p style="font-size:16px;color:var(--ink-soft);margin:0">3つの柱で、知識・個別対応・継続的な支えをセットでお届けします。</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(min(260px, 100%), 1fr));gap:24px">
        <div style="background:var(--card);border-radius:14px;padding:32px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px">
          <img src="/images/oyako-program/aadee301a173523a3137c97e0efd3599.png" alt="" style="width:100%;max-width:160px;height:auto;border-radius:12px;object-fit:contain;align-self:center">
          <div style="font-size:13px;font-weight:600;color:var(--coral);letter-spacing:0.04em">月2回・1時間</div>
          <h3 style="font-size:20px">オンラインワークショップ</h3>
          <p style="font-size:15px;line-height:1.7;color:var(--ink-soft);margin:0">公認心理師が講師を担当し、関わり方の具体的なスキルを毎回テーマに沿って学びます。</p>
        </div>
        <div style="background:var(--card);border-radius:14px;padding:32px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px">
          <img src="/images/oyako-program/7aabb5d69b9b0015862bcae4e8e7bf92.png" alt="" style="width:100%;max-width:160px;height:auto;border-radius:12px;object-fit:contain;align-self:center">
          <div style="font-size:13px;font-weight:600;color:var(--coral);letter-spacing:0.04em">月1回・30分</div>
          <h3 style="font-size:20px">個別オンラインカウンセリング</h3>
          <p style="font-size:15px;line-height:1.7;color:var(--ink-soft);margin:0">ご家庭ごとの状況に合わせて、公認心理師が1対1でじっくり相談に応じます。</p>
        </div>
        <div style="background:var(--card);border-radius:14px;padding:32px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px">
          <svg viewBox="0 0 200 160" style="width:100%;max-width:160px;height:auto;align-self:center" aria-hidden="true">
            <rect x="8" y="14" width="114" height="78" rx="30" fill="#E58F72"></rect>
            <path d="M30 86 L21 109 L54 90 Z" fill="#E58F72"></path>
            <circle cx="40" cy="53" r="7" fill="#FFFDF9"></circle>
            <circle cx="65" cy="53" r="7" fill="#FFFDF9"></circle>
            <circle cx="90" cy="53" r="7" fill="#FFFDF9"></circle>
            <rect x="76" y="54" width="116" height="78" rx="30" fill="#F9C35F"></rect>
            <path d="M150 126 L159 150 L124 130 Z" fill="#F9C35F"></path>
            <circle cx="110" cy="93" r="7" fill="#FFFDF9"></circle>
            <circle cx="134" cy="93" r="7" fill="#FFFDF9"></circle>
            <circle cx="158" cy="93" r="7" fill="#FFFDF9"></circle>
          </svg>
          <div style="font-size:13px;font-weight:600;color:var(--coral);letter-spacing:0.04em">期間中いつでも</div>
          <h3 style="font-size:20px">オンラインコミュニティ</h3>
          <p style="font-size:15px;line-height:1.7;color:var(--ink-soft);margin:0">参加者専用のオンラインコミュニティで、同じ悩みを持つ保護者同士がつながり、一人で抱え込まずに続けられる場をつくります。すぐにでも誰かとつながりたい方のため、お申込み後、コミュニティにも準備が整い次第先にご案内できます。開講（2027年2月）を待たずにご利用いただけます。</p>
        </div>
      </div>
    </div>
    <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style="display:block;width:100%;height:40px;position:absolute;left:0;bottom:-1px">
      <path d="M0,30 C360,-10 1080,70 1440,30 L1440,60 L0,60 Z" fill="var(--cream)"></path>
    </svg>
  </section>

  <!-- CURRICULUM -->
  <section id="curriculum" style="padding:72px 24px;max-width:960px;margin:0 auto">
    <div style="text-align:center;display:flex;flex-direction:column;gap:12px;margin-bottom:36px">
      <h2 style="font-size:clamp(20px,6vw,28px);color:var(--ink)">3ヶ月のカリキュラム（全6回）</h2>
      <p style="font-size:16px;color:var(--ink-soft);margin:0">段階的に学び、毎回「次回までの実践課題」を通して日常の中で試しながら、少しずつ「わが家の関わり方」を整えていきます。</p>
      <div style="display:flex;justify-content:center;margin-top:4px">
        <div class="pill">
          <span class="mini-icon" style="background:var(--sage-bg);color:var(--sage)"><svg width="16" height="16" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4M2 12a10 10 0 1 0 20 0 10 10 0 0 0-20 0z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>
          毎回、「次回までの実践課題」つき
        </div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(min(280px, 100%), 1fr));gap:20px">
      <div style="background:var(--card);border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04)">
        <div style="background:#DFF3F4;color:var(--ink);padding:16px 20px;display:flex;align-items:center;gap:10px;font-weight:600;font-size:14px;border-left:4px solid var(--coral)">
          <img src="/images/oyako-program/56c2a5400801e9702c55b68189e3f7be.png" alt="" style="width:28px;height:28px;object-fit:contain">
          1ヶ月目｜子どもの今を理解する
        </div>
        <div style="padding:20px;display:flex;flex-direction:column;gap:12px;font-size:14px;color:var(--ink-soft);line-height:1.6">
          <div style="display:flex;gap:8px"><span style="color:var(--coral);flex:0 0 auto;margin-top:2px">✓</span><div style="display:flex;flex-direction:column;gap:3px"><strong style="color:var(--ink)">第1回　「困った様子」の背景を知る</strong><div style="font-size:12.5px;color:var(--mute);line-height:1.5">不安・発達特性・環境の変化など、子どもの行動の背景にある心理を理解する</div></div></div>
          <div style="display:flex;gap:8px"><span style="color:var(--coral);flex:0 0 auto;margin-top:2px">✓</span><div style="display:flex;flex-direction:column;gap:3px"><strong style="color:var(--ink)">第2回　今の子どもへの関わり方</strong><div style="font-size:12.5px;color:var(--mute);line-height:1.5">変えようとする前に、安心できる関係をつくる声かけ</div></div></div>
        </div>
      </div>
      <div style="background:var(--card);border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04)">
        <div style="background:#DFF3F4;color:var(--ink);padding:16px 20px;display:flex;align-items:center;gap:10px;font-weight:600;font-size:14px;border-left:4px solid var(--coral)">
          <img src="/images/oyako-program/eeeff1db2c7bd437e60d86c933cfcf2a.png" alt="" style="width:28px;height:28px;object-fit:contain">
          2ヶ月目｜見えにくいサインと専門的な視点
        </div>
        <div style="padding:20px;display:flex;flex-direction:column;gap:12px;font-size:14px;color:var(--ink-soft);line-height:1.6">
          <div style="display:flex;gap:8px"><span style="color:var(--coral);flex:0 0 auto;margin-top:2px">✓</span><div style="display:flex;flex-direction:column;gap:3px"><strong style="color:var(--ink)">第3回　精神的な不調のサインを知る</strong><div style="font-size:12.5px;color:var(--mute);line-height:1.5">うつ・不安障害など気づいておきたい変化と、医療・専門機関に相談すべきタイミング</div></div></div>
          <div style="display:flex;gap:8px"><span style="color:var(--coral);flex:0 0 auto;margin-top:2px">✓</span><div style="display:flex;flex-direction:column;gap:3px"><strong style="color:var(--ink)">第4回　距離の取り方と踏み込む判断</strong><div style="font-size:12.5px;color:var(--mute);line-height:1.5">拒否や反発が強い時期に、無理に働きかけず見守る関わり方</div></div></div>
        </div>
      </div>
      <div style="background:var(--card);border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04)">
        <div style="background:#DFF3F4;color:var(--ink);padding:16px 20px;display:flex;align-items:center;gap:10px;font-weight:600;font-size:14px;border-left:4px solid var(--coral)">
          <img src="/images/oyako-program/84dea915739a11cc9ddb99ea1f0b4e85.png" alt="" style="width:28px;height:28px;object-fit:contain">
          3ヶ月目｜これからの関わり方
        </div>
        <div style="padding:20px;display:flex;flex-direction:column;gap:12px;font-size:14px;color:var(--ink-soft);line-height:1.6">
          <div style="display:flex;gap:8px"><span style="color:var(--coral);flex:0 0 auto;margin-top:2px">✓</span><div style="display:flex;flex-direction:column;gap:3px"><strong style="color:var(--ink)">第5回　生活リズムと「次の一歩」の作り方</strong><div style="font-size:12.5px;color:var(--mute);line-height:1.5">無理のない範囲で生活を整え、小さな行動のきっかけをつくる</div></div></div>
          <div style="display:flex;gap:8px"><span style="color:var(--coral);flex:0 0 auto;margin-top:2px">✓</span><div style="display:flex;flex-direction:column;gap:3px"><strong style="color:var(--ink)">第6回　振り返りとこれからのプラン</strong><div style="font-size:12.5px;color:var(--mute);line-height:1.5">3ヶ月の変化を振り返り、今後も続けられる関わり方をまとめる</div></div></div>
        </div>
      </div>
    </div>
    <div style="background:var(--peach);border-radius:14px;padding:24px 28px;margin-top:28px">
      <div style="font-size:15px;font-weight:600;color:var(--coral);margin-bottom:18px;text-align:center">1回60分の流れ</div>
      <div class="flow-wrap" style="display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:4px;max-width:100%;margin:0 auto">
        <div class="flow-step" style="display:flex;flex-direction:column;align-items:center;gap:8px;flex:0 1 150px;text-align:center"><span style="flex:0 0 28px;width:28px;height:28px;border-radius:50%;background:var(--card);color:var(--coral);font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center">1</span><span style="font-size:14px;font-weight:600;color:var(--ink)">振り返り</span></div>
        <div class="flow-arrow" style="color:var(--mute);font-size:18px">→</div>
        <div class="flow-step" style="display:flex;flex-direction:column;align-items:center;gap:8px;flex:0 1 150px;text-align:center"><span style="flex:0 0 28px;width:28px;height:28px;border-radius:50%;background:var(--card);color:var(--coral);font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center">2</span><span style="font-size:14px;font-weight:600;color:var(--ink)">専門的な解説</span></div>
        <div class="flow-arrow" style="color:var(--mute);font-size:18px">→</div>
        <div class="flow-step" style="display:flex;flex-direction:column;align-items:center;gap:8px;flex:0 1 150px;text-align:center"><span style="flex:0 0 28px;width:28px;height:28px;border-radius:50%;background:var(--card);color:var(--coral);font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center">3</span><span style="font-size:14px;font-weight:600;color:var(--ink)">保護者同士の対話</span></div>
        <div class="flow-arrow" style="color:var(--mute);font-size:18px">→</div>
        <div class="flow-step" style="display:flex;flex-direction:column;align-items:center;gap:8px;flex:0 1 150px;text-align:center"><span style="flex:0 0 28px;width:28px;height:28px;border-radius:50%;background:var(--card);color:var(--coral);font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center">4</span><span style="font-size:14px;font-weight:600;color:var(--ink)">まとめ・次回までの実践提案</span></div>
      </div>
      <p style="font-size:13px;color:var(--ink-soft);text-align:center;margin:18px 0 0">公認心理師が毎回通して関わり、最後に次回までの家庭での実践を1つ提案します。</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px;margin-top:28px">
      <div style="display:flex;gap:14px;align-items:flex-start">
        <span style="flex:0 0 36px;width:36px;height:36px;border-radius:50%;background:var(--gold-bg);color:var(--gold);display:flex;align-items:center;justify-content:center"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 20s-7-4.3-9.5-8.5C1 8 2.5 5 5.8 5c2 0 3.3 1.2 4.2 2.6C10.9 6.2 12.2 5 14.2 5c3.3 0 4.8 3 3.3 6.5C15 15.7 12 20 12 20z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"></path></svg></span>
        <div style="display:flex;flex-direction:column;gap:4px;padding-top:4px">
          <div style="font-size:15px;font-weight:600;color:var(--ink)">個別カウンセリングで、ご家庭固有の悩みを1対1でじっくり</div>
          <div style="font-size:13px;color:var(--ink-soft);line-height:1.6">ワークショップでは話しづらい内容も、公認心理師に個別にご相談いただけます。</div>
        </div>
      </div>
      <div style="display:flex;gap:14px;align-items:flex-start">
        <span style="flex:0 0 36px;width:36px;height:36px;border-radius:50%;background:#DFF3F4;color:var(--coral);display:flex;align-items:center;justify-content:center"><svg width="18" height="18" viewBox="0 0 24 24"><circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="2" fill="none"></circle><circle cx="16" cy="8" r="3" stroke="currentColor" stroke-width="2" fill="none"></circle><path d="M2 20c0-3 3-5 6-5s6 2 6 5M10 20c0-3 3-5 6-5s6 2 6 5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"></path></svg></span>
        <div style="display:flex;flex-direction:column;gap:4px;padding-top:4px">
          <div style="font-size:15px;font-weight:600;color:var(--ink)">オンラインコミュニティで、一人で抱え込まない</div>
          <div style="font-size:13px;color:var(--ink-soft);line-height:1.6">参加者同士が日々のようすや情報を共有できる場。必要に応じて公認心理師もようすを見ており、メッセージを入れることもあります。</div>
        </div>
      </div>
    </div>
    <p style="font-size:13px;color:var(--mute);margin-top:24px;text-align:center">※精神的な不調・医療連携に関する内容は、診断や治療を行うものではなく「気づきと相談先の案内」に範囲を限ります。</p>
  </section>

  <!-- INSTRUCTOR -->
  <section id="instructor" style="padding:72px 24px;max-width:960px;margin:0 auto">
    <h2 style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0">伴走する専門家の紹介</h2>
    <div class="instructor-wrap" style="display:flex;gap:32px;flex-wrap:wrap;align-items:flex-start">
      <div class="instructor-left" style="flex:0 1 220px;min-width:200px;display:flex;flex-direction:column;gap:20px">
        <div class="instructor-photo-col" style="display:flex;flex-direction:column;align-items:center;gap:10px">
          <img src="/images/oyako-program/04b3718ce70b94545a4281afbd58cea7.png" alt="田村俊作（公認心理師）" style="width:120px;height:120px;border-radius:50%;object-fit:cover;background:var(--peach);border:3px solid var(--card);box-shadow:0 2px 8px rgba(0,0,0,0.08)">
          <div style="background:#DFF3F4;color:var(--coral-dark);font-size:12px;font-weight:600;padding:5px 14px;border-radius:999px">伴走する専門家</div>
        </div>
        <div class="instructor-side" style="background:var(--card);border-radius:14px;padding:24px;flex-direction:column;gap:14px;display:none">
          <div style="font-size:14px;font-weight:600;color:var(--ink);display:flex;align-items:center;gap:8px">
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 20s-7-4.3-9.5-8.5C1 8 2.5 5 5.8 5c2 0 3.3 1.2 4.2 2.6C10.9 6.2 12.2 5 14.2 5c3.3 0 4.8 3 3.3 6.5C15 15.7 12 20 12 20z" stroke="var(--coral)" stroke-width="2" fill="none" stroke-linejoin="round"></path></svg>
            大切にしていること
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;font-size:13px;color:var(--ink-soft)">
            <div style="display:flex;gap:8px"><span style="color:var(--sage)">✓</span>診断の有無にかかわらず、同じように向き合う</div>
            <div style="display:flex;gap:8px"><span style="color:var(--sage)">✓</span>ご家庭のペースを大切にする</div>
            <div style="display:flex;gap:8px"><span style="color:var(--sage)">✓</span>安心して話せる場をつくる</div>
          </div>
        </div>
      </div>
      <div class="instructor-text-col" style="flex:1 1 320px;display:flex;flex-direction:column;gap:10px;min-width:260px">
          <h3 style="font-size:22px">田村俊作（公認心理師）</h3>
          <p style="font-size:15px;line-height:1.7;color:var(--ink-soft);margin:0">中学校・行政機関・地域の相談窓口など、教育・行政の現場を横断して約20年、子ども・保護者への支援を重ねてきた。スクールカウンセラーに加え、スクールソーシャルワーカー、精神保健相談員としての経験も持つ。現在は都内の学びの多様化学校（いわゆる不登校特例校）でスクールカウンセラーを務め、不登校の子ども・保護者と向き合い続けている。</p>
          <div style="position:relative;background:var(--card);border-radius:16px;padding:22px 22px 18px;margin-top:6px;box-shadow:0 1px 3px rgba(0,0,0,0.05)">
            <div style="font-family:'Fraunces',serif;font-size:44px;line-height:1;color:var(--coral);opacity:0.2;position:absolute;top:4px;left:14px">“</div>
            <p style="position:relative;z-index:1;font-size:14px;line-height:1.7;color:var(--ink-soft);margin:0;font-style:italic">「ひとりで抱え込まず、安心して話していただける場を。一緒に、ゆっくりと関わり方を考えていきたいと思います。」</p>
          </div>
        </div>
    </div>
    <p style="font-size:14px;line-height:1.7;color:var(--mute);margin:24px 0 0">子育て情報メディア「<a href="https://tetsunagi-p.com/" target="_blank" style="color:var(--coral)">てつなぎ</a>」にて、掲示板の声をもとにしたインタビューコラムの監修・取材対応を継続的に担当。</p>
    <div class="slide-in tetsunagi-auto-scroll" style="display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;padding:4px 4px 10px;margin-top:14px">
      <a href="https://tetsunagi-p.com/writing/66" style="flex:0 0 220px;scroll-snap-align:start;border-radius:10px;overflow:hidden;display:block"><img src="/images/oyako-program/5e96e654dc4e9d9c72c802e678b06677.jpg" alt="不登校編" style="width:100%;display:block"></a>
      <div style="flex:0 0 220px;scroll-snap-align:start;border-radius:10px;overflow:hidden"><img src="/images/oyako-program/5f385dbe6fba5b27ca9904e53453a06c.jpg" alt="限界・追い詰められる親の心理" style="width:100%;display:block"></div>
      <div style="flex:0 0 220px;scroll-snap-align:start;border-radius:10px;overflow:hidden"><img src="/images/oyako-program/389f509d48c10af301d90e08c3f92ca7.jpg" alt="夫婦関係編" style="width:100%;display:block"></div>
      <div style="flex:0 0 220px;scroll-snap-align:start;border-radius:10px;overflow:hidden"><img src="/images/oyako-program/ea490bd8178bdf6ad183e59925ea6953.jpg" alt="子どもの性被害と性教育" style="width:100%;display:block"></div>
      <div style="flex:0 0 220px;scroll-snap-align:start;border-radius:10px;overflow:hidden"><img src="/images/oyako-program/b9c7207aa46467c6b68ef85498ab0b30.jpg" alt="学校に行きたくないと言われたとき" style="width:100%;display:block"></div>
      <div style="flex:0 0 220px;scroll-snap-align:start;border-radius:10px;overflow:hidden"><img src="/images/oyako-program/ec1bd3b0af876a47ebdc83a1057a5aab.jpg" alt="いじめられてる？いじめてる？" style="width:100%;display:block"></div>
      <div style="flex:0 0 220px;scroll-snap-align:start;border-radius:10px;overflow:hidden"><img src="/images/oyako-program/cf1dc8bb39221188d9276fd9e1e64e77.jpg" alt="子どものSOSサイン7選" style="width:100%;display:block"></div>
      <div style="flex:0 0 220px;scroll-snap-align:start;border-radius:10px;overflow:hidden"><img src="/images/oyako-program/ee6cb2be7b3c75513be6772ae7c25c0b.jpg" alt="実母がしんどい" style="width:100%;display:block"></div>
    </div>
    <p style="font-size:12px;color:var(--mute);margin-top:6px">※画像を横にスクロールすると他のコラムもご覧いただけます。リンク先が確認できた「不登校編」以外は未リンクです。</p>
  </section>

  <!-- DIFFERENTIATION -->
  <section style="padding:72px 24px;max-width:960px;margin:0 auto">
    <div style="text-align:center;display:flex;flex-direction:column;gap:12px;margin-bottom:36px">
      <h2 style="font-size:clamp(22px,6vw,28px);color:var(--ink)">本プログラムの特徴</h2>
      <p style="font-size:16px;color:var(--ink-soft);margin:0">本プログラムが大切にしている、6つのポイントです。</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(min(240px, 100%), 1fr));gap:20px">
      <div class="diff-card" style="background:var(--card);border-radius:12px;padding:24px;display:flex;flex-direction:column;gap:10px">
        <div class="diff-icon" style="position:relative;width:52px;height:52px">
          <img src="/images/oyako-program/f3e41f2dcd0f5ebf7aa1983470e30956.png" alt="" style="width:52px;height:52px;object-fit:contain">
          <div style="position:absolute;bottom:-6px;right:-6px;width:24px;height:24px;border-radius:50%;background:var(--coral);color:#FFFDF9;font-family:'Fraunces',serif;font-weight:600;font-size:12px;display:flex;align-items:center;justify-content:center;border:2px solid var(--card)">01</div>
        </div>
        <div class="diff-text" style="display:flex;flex-direction:column;gap:10px">
          <div style="font-size:16px;font-weight:600">ワークショップ＋個別カウンセリング＋コミュニティのセット</div>
          <div style="font-size:14px;color:var(--ink-soft);line-height:1.6">グループでの学びと、ご家庭ごとの個別相談、同じ悩みを持つ保護者とのつながりを、ひとつのプログラムで。</div>
        </div>
      </div>
      <div class="diff-card" style="background:var(--card);border-radius:12px;padding:24px;display:flex;flex-direction:column;gap:10px">
        <div class="diff-icon" style="position:relative;width:52px;height:52px">
          <img src="/images/oyako-program/fca61f45b72e6fb5fef5c12811af00f9.png" alt="" style="width:52px;height:52px;object-fit:contain">
          <div style="position:absolute;bottom:-6px;right:-6px;width:24px;height:24px;border-radius:50%;background:var(--coral);color:#FFFDF9;font-family:'Fraunces',serif;font-weight:600;font-size:12px;display:flex;align-items:center;justify-content:center;border:2px solid var(--card)">02</div>
        </div>
        <div class="diff-text" style="display:flex;flex-direction:column;gap:10px">
          <div style="font-size:16px;font-weight:600">月１回、ご家庭だけの個別カウンセリング</div>
          <div style="font-size:14px;color:var(--ink-soft);line-height:1.6">グループでは話しにくいご家庭固有の悩みも、公認心理師が1対1でじっくりお聴きします。</div>
        </div>
      </div>
      <div class="diff-card" style="background:var(--card);border-radius:12px;padding:24px;display:flex;flex-direction:column;gap:10px">
        <div class="diff-icon" style="position:relative;width:52px;height:52px">
          <img src="/images/oyako-program/f7b30c791a8b9a2691ebe7fb22a8b155.png" alt="" style="width:52px;height:52px;object-fit:contain">
          <div style="position:absolute;bottom:-6px;right:-6px;width:24px;height:24px;border-radius:50%;background:var(--coral);color:#FFFDF9;font-family:'Fraunces',serif;font-weight:600;font-size:12px;display:flex;align-items:center;justify-content:center;border:2px solid var(--card)">03</div>
        </div>
        <div class="diff-text" style="display:flex;flex-direction:column;gap:10px">
          <div style="font-size:16px;font-weight:600">一人で抱え込まない、参加者専用コミュニティ</div>
          <div style="font-size:14px;color:var(--ink-soft);line-height:1.6">同じ悩みを持つ保護者同士がつながる場があり、プログラム期間中いつでも利用できます。</div>
        </div>
      </div>
      <div class="diff-card" style="background:var(--card);border-radius:12px;padding:24px;display:flex;flex-direction:column;gap:10px">
        <div class="diff-icon" style="position:relative;width:52px;height:52px">
          <img src="/images/oyako-program/de471b98085c340e1a66e00da4850bc9.png" alt="" style="width:52px;height:52px;object-fit:contain">
          <div style="position:absolute;bottom:-6px;right:-6px;width:24px;height:24px;border-radius:50%;background:var(--coral);color:#FFFDF9;font-family:'Fraunces',serif;font-weight:600;font-size:12px;display:flex;align-items:center;justify-content:center;border:2px solid var(--card)">04</div>
        </div>
        <div class="diff-text" style="display:flex;flex-direction:column;gap:10px">
          <div style="font-size:16px;font-weight:600">発達特性・診断の有無を問わずご参加いただけます</div>
          <div style="font-size:14px;color:var(--ink-soft);line-height:1.6">診断の有無にかかわらず、事前の医師の診察や検診も不要です。お子さんの関わり方に悩むすべての保護者が対象です。</div>
        </div>
      </div>
      <div class="diff-card" style="background:var(--card);border-radius:12px;padding:24px;display:flex;flex-direction:column;gap:10px">
        <div class="diff-icon" style="position:relative;width:52px;height:52px">
          <img src="/images/oyako-program/56c2a5400801e9702c55b68189e3f7be.png" alt="" style="width:52px;height:52px;object-fit:contain">
          <div style="position:absolute;bottom:-6px;right:-6px;width:24px;height:24px;border-radius:50%;background:var(--coral);color:#FFFDF9;font-family:'Fraunces',serif;font-weight:600;font-size:12px;display:flex;align-items:center;justify-content:center;border:2px solid var(--card)">05</div>
        </div>
        <div class="diff-text" style="display:flex;flex-direction:column;gap:10px">
          <div style="font-size:16px;font-weight:600">3ヶ月で、関わり方の大事なことがまとまって学べる</div>
          <div style="font-size:14px;color:var(--ink-soft);line-height:1.6">月２回のペースで無理なく通いながら、子どもとの関わり方に必要なポイントを3ヶ月で一通り身につけられます。</div>
        </div>
      </div>
      <div class="diff-card" style="background:var(--card);border-radius:12px;padding:24px;display:flex;flex-direction:column;gap:10px">
        <div class="diff-icon" style="position:relative;width:52px;height:52px">
          <img src="/images/oyako-program/d33e10b8493ce6b029cccc6c9769f7ea.png" alt="" style="width:52px;height:52px;object-fit:contain">
          <div style="position:absolute;bottom:-6px;right:-6px;width:24px;height:24px;border-radius:50%;background:var(--coral);color:#FFFDF9;font-family:'Fraunces',serif;font-weight:600;font-size:12px;display:flex;align-items:center;justify-content:center;border:2px solid var(--card)">06</div>
        </div>
        <div class="diff-text" style="display:flex;flex-direction:column;gap:10px">
          <div style="font-size:16px;font-weight:600">現役の公認心理師が伴走</div>
          <div style="font-size:14px;color:var(--ink-soft);line-height:1.6">過去の経験談ではなく、今も現場で不登校の子ども・保護者と向き合いつづけている公認心理師が、実感に根ざした関わり方を一緒に考えます。</div>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section id="faq" style="background:var(--peach);padding:72px 24px;position:relative">
    <img src="/images/oyako-program/4bf347b0d99f50a5ae1cb6ed0155d282.png" alt="" style="position:absolute;bottom:40px;left:0;width:110px;height:110px;object-fit:contain;opacity:0.35;pointer-events:none;transform:scaleX(-1)">
    <div style="max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:16px;position:relative;z-index:1">
      <div style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;margin-bottom:12px">
        <div class="icon-badge" style="background:var(--card);color:var(--coral)"><svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"></circle><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"></path><circle cx="12" cy="17" r="0.9" fill="currentColor"></circle></svg></div>
        <h2 style="font-size:clamp(22px,6vw,28px);color:var(--ink)">よくあるご質問</h2>
      </div>
      <details style="background:var(--card);border-radius:12px;padding:20px 24px" open="">
        <summary style="display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:16px;font-weight:600;color:var(--coral)">発達の診断を受けていなくても参加できますか？<span class="chev">▾</span></summary>
        <div style="font-size:15px;color:var(--ink-soft);line-height:1.7;margin-top:10px">はい、診断の有無は問いません。発達特性があるかどうかにかかわらず、ご参加いただけます。</div>
      </details>
      <details style="background:var(--card);border-radius:12px;padding:20px 24px">
        <summary style="display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:16px;font-weight:600;color:var(--coral)">不登校ではなく、行き渋り程度でも対象になりますか？<span class="chev">▾</span></summary>
        <div style="font-size:15px;color:var(--ink-soft);line-height:1.7;margin-top:10px">はい。不登校に限らず、お子さんとの関わり方に迷いや不安がある方であれば対象です。</div>
      </details>
      <details style="background:var(--card);border-radius:12px;padding:20px 24px">
        <summary style="display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:16px;font-weight:600;color:var(--coral)">対象は小学生～高校生くらいとなっていますが、未就学児でも参加できますか？<span class="chev">▾</span></summary>
        <div style="font-size:15px;color:var(--ink-soft);line-height:1.7;margin-top:10px">対象の目安は小学生～高校生くらいのお子さんですが、未就学児の方でもご希望があればご相談ください。</div>
      </details>
      <details style="background:var(--card);border-radius:12px;padding:20px 24px">
        <summary style="display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:16px;font-weight:600;color:var(--coral)">医療的な相談や診断もしてもらえますか？<span class="chev">▾</span></summary>
        <div style="font-size:15px;color:var(--ink-soft);line-height:1.7;margin-top:10px">本プログラムは診断や治療を行うものではありません。気づきと、必要に応じた相談先のご案内に範囲を限ります。</div>
      </details>
      <details style="background:var(--card);border-radius:12px;padding:20px 24px">
        <summary style="display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:16px;font-weight:600;color:var(--coral)">途中でやめることはできますか？キャンセルの場合、返金はありますか？<span class="chev">▾</span></summary>
        <div style="font-size:15px;color:var(--ink-soft);line-height:1.7;margin-top:10px">ご都合によるお取消・ご退会については、原則として返金はいたしかねます。なお、最少催行人数（4名）に満たず開催自体を中止する場合は、全額返金いたします。※本ポリシーは現時点の仮案です。</div>
      </details>
      <details style="background:var(--card);border-radius:12px;padding:20px 24px">
        <summary style="display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:16px;font-weight:600;color:var(--coral)">欠席した場合、アーカイブ（録画）はありますか？<span class="chev">▾</span></summary>
        <div style="font-size:15px;color:var(--ink-soft);line-height:1.7;margin-top:10px">グループワークでは参加者同士の個人的なお話もうかがうため、全体の録画はおこなっておりません。欠席された回については、公認心理師による専門的な解説部分のみを録画し、後日共有いたします。</div>
      </details>
      <details style="background:var(--card);border-radius:12px;padding:20px 24px">
        <summary style="display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:16px;font-weight:600;color:var(--coral)">個人情報やLINEでのやり取りの扱いについて教えてください。<span class="chev">▾</span></summary>
        <div style="font-size:15px;color:var(--ink-soft);line-height:1.7;margin-top:10px">ご登録いただいた情報やオンラインコミュニティでの投稿内容は、本プログラムの運営以外の目的には使用しません。</div>
      </details>
      <details style="background:var(--card);border-radius:12px;padding:20px 24px">
        <summary style="display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:16px;font-weight:600;color:var(--coral)">夫婦で参加することはできますか？<span class="chev">▾</span></summary>
        <div style="font-size:15px;color:var(--ink-soft);line-height:1.7;margin-top:10px">はい。おひとり分のお申し込みで、ご夫婦お二人でご参加いただけます。お二人目は半額（¥34,900）です。個別カウンセリング（オンライン）は1回45分、お二人そろって同じ画面でご参加いただく形です（アカウントは1つ）。オンラインコミュニティなどのコミュニティは、お二人それぞれのアカウントでご参加いただけます。</div>
      </details>
    </div>
    <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style="display:block;width:100%;height:40px;position:absolute;left:0;bottom:-1px">
      <path d="M0,30 C360,70 1080,-10 1440,30 L1440,60 L0,60 Z" fill="var(--cream)"></path>
    </svg>
  </section>

  <!-- PRICE -->
  <section style="background:var(--cream);padding:72px 24px">
    <div style="max-width:780px;margin:0 auto;background:var(--card);border-radius:16px;padding:40px;box-shadow:0 2px 12px rgba(0,0,0,0.04);display:flex;flex-direction:column;gap:28px">
      <div style="display:flex;align-items:center;justify-content:center;gap:10px">
        <div class="icon-badge" style="background:var(--peach);color:var(--coral);width:40px;height:40px;flex:0 0 40px"><svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"></circle><text x="12" y="16.5" font-size="11" text-anchor="middle" fill="currentColor" font-family="sans-serif">¥</text></svg></div>
        <h2 style="font-size:clamp(19px,5.5vw,24px)">料金・開催概要</h2>
      </div>
      <div style="display:flex;gap:32px;flex-wrap:wrap;align-items:center">
        <div style="flex:1 1 320px;min-width:260px;display:grid;grid-template-columns:auto 1fr;gap:10px 16px;font-size:15px;color:var(--ink-soft)"><span style="color: var(--mute); white-space: nowrap">期間</span><span>3ヶ月間</span>
          <span style="color: var(--mute); white-space: nowrap">定員</span><span>先着６名（最少催行4名）※先着順、定員に達し次第終了</span>
          <span style="color: var(--mute); white-space: nowrap">対象</span><span>小学生～高校生くらいのお子さんを持つ保護者（目安。発達特性・診断の有無は問いません）</span>
          <span style="color: var(--mute); white-space: nowrap">日程</span><span>2027年2月14日（日）・2月28日（日）・3月14日（日）・3月28日（日）・4月11日（日）・4月25日（日）　全6回、各回21:00〜</span>
          <span style="color: var(--mute); white-space: nowrap">開催方法</span><span>オンライン</span>
          <span style="color: var(--mute); white-space: nowrap">早期割引</span><span>2026年12月31日（木）までのお申込みで¥3,000引き（¥66,800）</span>
          <span style="color: var(--mute); white-space: nowrap">申込締切</span><span>2027年1月31日（日）※先着６名に達し次第、締切日前でも受付を終了します</span>
          <span style="color: var(--mute); white-space: nowrap">お支払い方法</span><span>お申込み後ご案内します</span>
        </div>
        <div style="flex:1 1 220px;min-width:220px;display:flex;flex-direction:column;align-items:center;gap:14px;background:var(--peach);border-radius:14px;padding:28px">
          <div style="font-size:11px;font-weight:700;color:#FFFDF9;background:var(--coral);padding:4px 14px;border-radius:999px;letter-spacing:0.04em">早期割引キャンペーン実施中</div>
          <div style="font-size:13px;font-weight:600;color:var(--coral);letter-spacing:0.04em">初回特別価格</div>
          <div style="display:flex;align-items:baseline;gap:10px">
            <div style="font-size:16px;color:var(--mute);text-decoration:line-through">¥69,800</div>
            <div style="font-size:clamp(28px,9vw,38px);font-weight:700;font-family:'Fraunces',serif;color:var(--ink)">¥66,800</div>
          </div>
          <div style="font-size:13px;color:var(--mute)">（3ヶ月・税込）</div>
          <div style="font-size:12px;font-weight:600;color:var(--coral);text-align:center">2026年12月31日（木）までのお申込み限定</div>
          <a href="#apply" class="btn" style="width:100%">お申し込みはこちら</a>
          <div style="font-size:12px;color:var(--coral);font-weight:600;text-align:center">お申込み後、コミュニティにも準備次第、先にご案内できます</div>
          <div style="font-size:12px;color:var(--mute);text-align:center">ご夫婦でご参加の場合、お二人目は半額（¥34,900）</div>
        </div>
      </div>
      <div style="border-top:1px solid #EFE6D8;padding-top:20px;display:flex;flex-direction:column;gap:8px;font-size:14px;color:var(--ink-soft)">
        <div style="font-size:12px;color:var(--mute);text-align:center">※上記日程は現時点で確定しているものです。やむを得ず変更となる場合は、お申込みいただいた方に個別にご案内します。</div>
      </div>
    </div>
  </section>

  <!-- CTA / CONTACT -->
  <section id="apply" style="padding:88px 24px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:20px">
    <h2 style="font-size:clamp(20px,6vw,26px);max-width:600px">3ヶ月後、子どもとの関わり方が変わっている自分へ</h2>
    <p style="font-size:15px;color:var(--mute);margin:0">お申し込みは下記フォームより。お申し込み確定後、1週間以内に振込先をメールでご案内します。</p>
    <a href="https://forms.gle/VMunyinEv4MfTV368" target="_blank" class="btn">お申し込みフォームへ →</a>
    <div style="font-size:12px;color:var(--mute)">ご不明点は <a href="mailto:mail.manapri@gmail.com" style="color:var(--mute);text-decoration:underline">mail.manapri@gmail.com</a> までお気軽にどうぞ</div>
  </section>

  <!-- LEGAL NOTICE -->
  <section style="padding:48px 24px;max-width:700px;margin:0 auto">
    <details style="background:var(--peach);border-radius:10px;padding:16px 24px">
      <summary style="cursor:pointer;font-size:15px;font-weight:600;color:var(--ink);text-align:center;list-style:none">特定商取引法に基づく表記を見る</summary>
    <div style="display:flex;flex-direction:column;gap:8px;font-size:13px;color:var(--ink-soft);margin-top:16px">
      <div>販売価格：¥69,800（税込）※2026年12月31日までのお申込みは早期割引価格¥66,800（税込）</div>
      <div>お支払い方法：ご申込後の一括前払い</div>
      <div>お支払い時期：お申込みから1週間以内</div>
      <div>提供時期：2027年2月14日・2月28日・3月14日・3月28日・4月11日・4月25日（全6回、各回21:00〜）</div>
      <div>キャンセル・返金について：上記FAQをご参照ください</div>
      <div>販売事業者情報：<a href="https://futoko-dosuru.com/tokushoho" target="_blank">どうする先生の特定商取引法に基づく表記</a>をご確認ください</div>
    </div>
    </details>
  </section>

  <div style="display:flex;justify-content:center;padding:8px 24px 0">
    <a href="#top" style="display:inline-flex;align-items:center;gap:8px;color:var(--mute);font-size:13px;font-weight:600">
      <span style="width:34px;height:34px;border-radius:50%;background:var(--card);display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,0.08);color:var(--coral)"><svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>
      ページ上部へ戻る
    </a>
  </div>

  <footer style="padding:28px 24px;text-align:center;font-size:13px;color:var(--mute)">
    公認心理師が伴走する、子どもとの関わり方3ヶ月実践プログラム
  </footer>

</div>
`;

const AUTO_SCROLL_JS = `
(function(){
  function initAutoScroll(el){
    var speed = 0.6, paused = false, hovered = false, touching = false;
    function step(){
      if(!paused && !hovered && !touching){
        if(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1){
          el.scrollLeft = 0;
        } else {
          el.scrollLeft += speed;
        }
      }
      requestAnimationFrame(step);
    }
    el.addEventListener('mouseenter', function(){ hovered = true; });
    el.addEventListener('mouseleave', function(){ hovered = false; });
    el.addEventListener('touchstart', function(){ touching = true; }, {passive:true});
    el.addEventListener('touchend', function(){ setTimeout(function(){ touching = false; }, 2500); }, {passive:true});
    el.addEventListener('pointerdown', function(){ paused = true; });
    window.addEventListener('pointerup', function(){ setTimeout(function(){ paused = false; }, 1500); });
    requestAnimationFrame(step);
  }
  function start(){
    document.querySelectorAll('.tetsunagi-auto-scroll').forEach(initAutoScroll);
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
`;

export default async function OyakoProgramPage() {
  'use cache';
  cacheLife('max');
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PAGE_STYLE }} />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Work+Sans:wght@400;500;600;700&display=swap"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: FAQ_JSONLD }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: COURSE_JSONLD }}
      />
      <div className="oyako-lp" style={{ minHeight: '100vh' }}>
        <div style={{ padding: '12px 20px' }}>
          <Link
            href="/"
            style={{ fontSize: 13, color: 'var(--ink-soft, #4D5355)', textDecoration: 'none' }}
          >
            ← どうする先生 トップへ
          </Link>
        </div>
        <div dangerouslySetInnerHTML={{ __html: PAGE_BODY }} />
      </div>
      <script dangerouslySetInnerHTML={{ __html: AUTO_SCROLL_JS }} />
    </>
  );
}
