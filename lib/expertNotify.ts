import { getSupabaseAdmin } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';
import { expertDisplayName, answererName } from '@/lib/expertDisplay';
import { SITE_URL, SITE_NAME } from '@/lib/site';

// 新しい相談が専門家・経験者の回答待ちキューに乗った直後、本人確認済みの専門家・
// 経験者全員にメールで知らせる（2026-11-03追加、/api/consult/route.tsにあったものを
// 2026-11-07にlib化。kotoba（/api/kotoba-honyaku）からも同じ通知を送れるようにする
// ため）。「相談があるごとに通知がほしい」との要望を受けて、週次ダイジェスト
// （/api/cron/expert-pending-digest）に加えて即時通知も用意した。共有キュー
// （指名制ではない）のため全員へ同内容を送る。レスポンスを遅らせたくないため、
// 呼び出し側ではawaitせずfire-and-forget（next/serverのafter()）で使う。
export async function notifyExpertsOfNewPending(question: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { data: experts } = await supabase
      .from('experts')
      .select('email, name, display_name, credential')
      .eq('verified', true);
    if (!experts || experts.length === 0) return;
    const snippet = question.length > 60 ? `${question.slice(0, 60)}…` : question;
    await Promise.all(
      experts
        .filter((e) => !!e.email)
        .map((e) => {
          const role = answererName(e.credential);
          const name = expertDisplayName(e);
          return sendEmail({
            to: e.email as string,
            subject: `【${SITE_NAME}】新しい相談が届いています`,
            text: `${name}さん

${SITE_NAME}に、${role}からの回答を待っている新しい相談が届きました。

相談内容：
${snippet}

答えたい質問であれば、アカウントページから回答できます：
${SITE_URL}/account

${SITE_NAME}
${SITE_URL}`,
          });
        })
    );
  } catch {
    // 通知の失敗で相談の投稿自体に影響が出ないよう、ここでは握りつぶす
    // （既存のai_limit_hits記録等と同じ、fire-and-forgetの考え方）。
  }
}
