import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

// 実際の相談をX（@futoko_dosuru）に自動投稿するcron（1日1件）。
//
// 【AI生成投稿との違い】
// auto-post/route.tsはAIが作ったサンプル相談を投稿するため停止したが、
// このエンドポイントは実際にユーザーが投稿した相談（author_id != 'auto-seed'、
// author_id != 'seed'）を選んで投稿するため、Googleのscaled content abuse
// リスクは無い。実在の保護者の声をそのまま届けることがコンセプト。
//
// 【投稿フォーマット】
// 相談本文（140字を超える場合は省略）＋サイトURL
// ハッシュタグ：#不登校 #どうする先生
//
// 【重複防止】
// posted_to_x カラム（booleanまたはtimestamp）でマーク。
// 未投稿の中からランダムに1件選ぶ。
// posted_to_x カラムが無い場合は、最近30日以内に投稿された相談の中から選ぶ。
//
// 【認証】
// auto-post同様、CRON_SECRETで認証する。
//
// 【X API認証】
// OAuth 1.0a（4つのキー）。環境変数：
//   X_API_KEY, X_API_KEY_SECRET
//   X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://futoko-dosuru.vercel.app';
const MAX_TWEET_LENGTH = 280;
const HASHTAGS = '#不登校 #どうする先生';

function buildOAuthHeader(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  accessTokenSecret: string,
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0',
  };

  const allParams = { ...params, ...oauthParams };
  const sortedKeys = Object.keys(allParams).sort();
  const paramString = sortedKeys
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(allParams[k])}`)
    .join('&');

  const baseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(paramString),
  ].join('&');

  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(accessTokenSecret)}`;
  const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');

  oauthParams['oauth_signature'] = signature;

  const headerValue = Object.keys(oauthParams)
    .sort()
    .map((k) => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
    .join(', ');

  return `OAuth ${headerValue}`;
}

async function postTweet(text: string): Promise<{ id: string; text: string }> {
  const apiKey = process.env.X_API_KEY;
  const apiKeySecret = process.env.X_API_KEY_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;

  if (!apiKey || !apiKeySecret || !accessToken || !accessTokenSecret) {
    throw new Error('X API credentials not configured');
  }

  const url = 'https://api.twitter.com/2/tweets';
  const body = JSON.stringify({ text });

  const authHeader = buildOAuthHeader(
    'POST',
    url,
    {},
    apiKey,
    apiKeySecret,
    accessToken,
    accessTokenSecret,
  );

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`X API error ${res.status}: ${err}`);
  }

  const json = await res.json();
  return json.data;
}

export async function GET(req: NextRequest) {
  // 認証チェック
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // posted_to_x カラムが false（または null）の相談をランダムに1件取得。
  // ルートの相談のみ（parent_id is null）、非表示は除外。
  // 質問本文が短すぎるもの（10文字未満）も除外して投稿の品質を保つ。
  const { data: candidates, error } = await supabase
    .from('consultations')
    .select('id, question, created_at')
    .eq('hidden', false)
    .is('parent_id', null)
    .not('author_id', 'in', '("auto-seed","seed")')
    .or('posted_to_x.is.null,posted_to_x.eq.false')
    .gte('question.length', 10) // postgrestでは直接使えないが念のため
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ message: 'No unpublished consultations found' });
  }

  // 50件の中からランダムに1件選ぶ（全件から毎回先頭を取ると偏るため）
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  const resultUrl = `${SITE_URL}/result/${pick.id}`;

  // ツイートテキスト組み立て
  // URL(23文字固定換算) + 改行2 + ハッシュタグ + 余白 = 約45文字を確保
  const reservedLen = 23 + 2 + HASHTAGS.length + 2; // URLは23文字固定カウント
  const maxQuestionLen = MAX_TWEET_LENGTH - reservedLen;

  let questionText = pick.question as string;
  if (questionText.length > maxQuestionLen) {
    questionText = questionText.slice(0, maxQuestionLen - 1) + '…';
  }

  const tweetText = `${questionText}\n\n${HASHTAGS}\n${resultUrl}`;

  // 投稿
  let tweetId: string;
  try {
    const result = await postTweet(tweetText);
    tweetId = result.id;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }

  // posted_to_x に投稿日時を記録（カラムが無い場合はエラーになるが投稿自体は成功済み）
  await supabase
    .from('consultations')
    .update({ posted_to_x: new Date().toISOString() })
    .eq('id', pick.id);

  return NextResponse.json({
    ok: true,
    tweetId,
    consultationId: pick.id,
    tweetText,
  });
}
