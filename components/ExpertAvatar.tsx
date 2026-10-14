// 専門家プロフィール用のアバター表示。写真が未登録の場合のフォールバックとして、
// 以前はAIキャラクター「どうする先生」のロゴ画像（sensei_logo.png）を流用していたが、
// 専門家は実在の人物のプロフィールであり、AIのキャラクター画像をそのまま使うと
// 「この専門家＝AI」であるかのような誤解を招くため、人物を表す汎用アイコンに
// 差し替えた（2026-10-14、「プロフィールのイメージがAIのどうする先生だから、
// ここはリアルな人の写真イメージに変えたい」との指摘を受けて追加）。
export default function ExpertAvatar({
  photoUrl,
  size = 64,
}: {
  photoUrl?: string | null;
  size?: number;
}) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt=""
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        background: 'var(--orange-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="4" fill="var(--orange-text)" />
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="var(--orange-text)" />
      </svg>
    </div>
  );
}
