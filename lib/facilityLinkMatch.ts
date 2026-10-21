import { FREE_SCHOOLS, FreeSchool } from './data/freeSchools';
import { CORRESPONDENCE_HIGH_SCHOOLS, CorrespondenceHighSchool } from './data/correspondenceHighSchools';

// 相談文（質問・AI回答）に、フリースクール一覧（freeSchools.ts）・通信制高校一覧
// （correspondenceHighSchools.ts）に載っている施設名が含まれている場合、その施設の
// 詳細ページへの内部リンクを出すための仕組み（2026-10-21追加）。
//
// lib/schoolFacts.ts（学びの多様化学校のfindMentionedSchool）と同じ「回答で話題に
// なった固有の学校・施設を当サイトのデータから特定し、詳細ページへ案内する」という
// 考え方を、フリースクール・通信制高校にも広げたもの（きっかけ：
// 「学校法人角川ドワンゴ学園N中等部秋葉原キャンパスについて」という相談で、同校が
// freeSchools.tsのデータにしか無く、学びの多様化学校向けのfindMentionedSchoolでは
// 検出できず、/gakko/free/149へのリンクが出ていなかった）。
//
// 注意：ここはlib/institutionFacts.ts・lib/schoolFacts.tsのようなAIへの事実注入
// （プロンプトに渡す）とは別の目的（回答を読んだ人向けの内部リンク表示）のため、
// 一致した施設名をAIに渡すことはしない。

function findByName<T extends { name: string }>(
  texts: (string | null | undefined)[],
  items: readonly T[]
): T | null {
  const haystack = texts.filter(Boolean).join('\n');
  if (!haystack) return null;

  let best: T | null = null;
  let bestLen = -1;
  for (const item of items) {
    // 短すぎる名称は誤マッチしやすいため対象外（lib/schoolFacts.tsのcoreName判定と
    // 同じ閾値）。
    if (!item.name || item.name.length <= 3) continue;
    if (!haystack.includes(item.name)) continue;
    // 同時に複数件一致した場合は、より長い（＝より具体的な）名称が一致した方を優先する。
    if (item.name.length > bestLen) {
      best = item;
      bestLen = item.name.length;
    }
  }
  return best;
}

export function findMentionedFreeSchool(texts: (string | null | undefined)[]): FreeSchool | null {
  return findByName(texts, FREE_SCHOOLS);
}

export function findMentionedCorrespondenceSchool(
  texts: (string | null | undefined)[]
): CorrespondenceHighSchool | null {
  return findByName(texts, CORRESPONDENCE_HIGH_SCHOOLS);
}
