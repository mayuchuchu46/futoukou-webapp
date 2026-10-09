-- どうする先生（不登校編） Supabase スキーマ
-- Supabaseのプロジェクト作成後、SQL Editorでこのファイルの内容を実行してください。

create extension if not exists "pgcrypto";

create table if not exists consultations (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('body','social','will','other')),
  question text not null,
  answer text not null,
  author_id text not null,
  likes int not null default 0,
  liked_by text[] not null default '{}',
  comment_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references consultations(id) on delete cascade,
  author_id text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists guidelines (
  id text primary key default 'default',
  supervised boolean not null default false,
  supervised_by text,
  last_reviewed timestamptz,
  categories jsonb not null default '{
    "body":  {"dos": [], "donts": [], "samplePhrases": []},
    "social":{"dos": [], "donts": [], "samplePhrases": []},
    "will":  {"dos": [], "donts": [], "samplePhrases": []},
    "other": {"dos": [], "donts": [], "samplePhrases": []}
  }'::jsonb
);

insert into guidelines (id) values ('default') on conflict (id) do nothing;

-- サンプルデータ（デザインプロトタイプと同じ3件）
insert into consultations (category, question, answer, author_id, likes, comment_count) values
('body', '小5の息子が、ここ2週間毎朝「お腹痛い」と言って学校に行きたがりません。小児科で検査しても異常なしと言われました。仮病なんでしょうか。',
 '今日から3日間、起床直後と立ち上がった直後の脈拍を測ってください。やり方：朝、目が覚めたら横になったまま1分間脈を測る→その後立ち上がって1分後にもう一度測る。差が20以上あれば、起立性調節障害の可能性が高まります。この記録を持って小児科を受診してください。',
 'seed', 12, 2),
('social', '中2の娘がクラスでのトラブルをきっかけに1ヶ月不登校です。本人は「クラスには戻りたくない」と言っています。',
 'まずは「クラスに戻る」以外の選択肢を本人と一緒に書き出してみてください。別室登校、保健室登校、オンライン授業など、学校に確認できる選択肢を今週中にリストアップし、本人に選んでもらう形にすると、本人の主体性が戻りやすくなります。',
 'seed', 8, 1),
('will', '小6の息子が「学校の意味が分からない」と言い出し、1週間休んでいます。叱っても効果がありません。',
 '叱るのをまず1週間やめて、「学校以外で学んでいること」を1つ見つけて褒めてみてください。ゲームの攻略法を調べる、好きな本を読む、工作をするなど、何でも構いません。学ぶこと自体への抵抗をなくすのが最初の一歩です。',
 'seed', 15, 3)
on conflict do nothing;
