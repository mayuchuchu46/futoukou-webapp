import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { getSupabaseAdmin } from '@/lib/supabase';

// ビルド時の静的化はせず、監修状態（guidelines.supervised）を
// リクエストごとにサーバー側で取得して反映する。
export const instant = false;

async function getGuidelines() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('guidelines').select('*').eq('id', 'default').single();
  return data;
}

export default async function AboutPage() {
  const guidelines = await getGuidelines();

  const supervisionText = guidelines?.supervised
    ? `${guidelines.supervised_by ? guidelines.supervised_by + 'さんが監修した' : '公認心理師が監修した'}対応方針をもとに回答しています。`
    : '現在の回答内容は、公認心理師による正式な監修を受けていない下書きの対応方針をもとにしています。順次、専門家の確認を進めています。';

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <Link href="/mypage" className="backlink">← もどる</Link>

        <div className="card" style={{ alignItems: 'center', textAlign: 'center', gap: 10 }}>
          <img
            src="/assets/sensei_logo.png"
            alt="どうする先生"
            style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--sub)' }}
          />
          <div style={{ fontFamily: "'M PLUS Rounded 1c', sans-serif", fontSize: 18, fontWeight: 800, color: 'var(--main)' }}>
            どうする先生
          </div>
          <div className="muted">不登校のご家庭に、次の一手を届けるAI</div>
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>どうする先生とは</div>
          <div className="qtext">
            「どうする先生」は、入力された状況をもとに、今できる具体的な対応を一緒に考えるAIです。実在する人物ではありません。一般的に知られている対応の目安をもとに回答しており、医療的・心理的な診断は行いません。
          </div>
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>回答の監修について</div>
          <div className="qtext">{supervisionText}</div>
        </div>

        <Link href="/ask" className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>🔒 専門家による有料回答について</div>
          <div className="qtext">
            AIの自動回答とは別に、公認心理師など資格を持つ専門家本人が相談文を直接読んで回答する有料機能も用意しています。月¥800の読み放題会員になると、他の人への専門家回答もすべて読めます。会員はさらに1回¥500で専門家に直接質問できます。
          </div>
          <div className="muted" style={{ alignSelf: 'flex-end', fontWeight: 700, color: 'var(--orange-text)' }}>
            相談するページへ ›
          </div>
        </Link>

        <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>大切なお願い</div>
          <div className="qtext">
            緊急性が高いと感じるとき、またはお子さんの安全に関わる場合は、AIの回答を待たず、学校や医療機関、公的な相談窓口にご連絡ください。
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
