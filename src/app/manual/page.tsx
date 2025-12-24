import Link from "next/link";

const INPUT_SECTIONS = [
  {
    title: "はじめの資金（円）",
    body: "最初の元手です。ここを基準に、1回の許容損失と建玉金額を計算します。",
  },
  {
    title: "停止ライン（%）",
    body: "資金がこの%を下回ったら運用停止とみなします。高いほど安全寄りですが止まりやすくなります。",
  },
  {
    title: "勝率（%）",
    body: "1回の取引が勝つ割合です。Backtesting.pyのWin Rateに近い値を入力します。",
  },
  {
    title: "勝ったときの平均利益（%）",
    body: "勝ったときに平均で何%増えるかです。複利やレバ込みの結果でもOKです。",
  },
  {
    title: "負けたときの平均損失（%）",
    body: "負けたときに平均で何%減るかです。マイナス記号は不要です。",
  },
  {
    title: "最大ドローダウン（DD）（%）",
    body: "先物・FXで使う値です。期間全体での最大下落幅で、想定損失の計算に使います。",
  },
  {
    title: "1トレード平均損益（期待値）（%）",
    body: "先物・FXで使う値です。1回あたりの平均損益で、Backtesting.pyの期待値に近い値を入力します。",
  },
  {
    title: "ボラティリティ（ATR）（%）",
    body: "先物・FXで使う値です。平均的な値動きの大きさで、ストップ幅の参考に使います。",
  },
  {
    title: "最大連敗数",
    body: "先物・FXで使う値です。検証期間で一番長かった連敗回数です。",
  },
  {
    title: "想定トレード回数（回）",
    body: "この回数の中で起きそうな連敗を見積もります。多いほど安全寄りになります。",
  },
  {
    title: "停止ラインを割る確率の目安（%）",
    body: "小さいほど安全寄りです。保証ではなく目安として使います。",
  },
  {
    title: "攻めすぎ防止（成長の理論値を抑える）",
    body: "ケリー理論値をそのまま使わないための抑制係数です。",
  },
  {
    title: "損切りゆとり（平均損失に上乗せ）",
    body: "平均損失に少し余裕を持たせる倍率です。大きいほど安全寄りです。",
  },
  {
    title: "1回の最大損失（資金に対して%）",
    body: "どんな場合でも1回でこれ以上失わない上限です。",
  },
];

const OUTPUT_SECTIONS = [
  {
    title: "建玉（投入額）の目安",
    body: "損切り幅と許容損失から逆算した投入額の目安です。",
  },
  {
    title: "損切り幅の目安",
    body: "平均損失と損切りゆとりから決めた推奨ストップ幅です。",
  },
  {
    title: "最大DD換算の想定損失",
    body: "最大DD（%）を資金に掛けた目安です。DD未入力の場合は計算上の最大損失になります。",
  },
];

export default function ManualPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,hsl(var(--primary)_/_0.18),transparent_55%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background)))]">
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 md:p-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">ユーザーマニュアル</p>
          <h1 className="text-2xl font-bold md:text-3xl">各項目の説明</h1>
          <p className="text-sm text-muted-foreground">
            初心者向けに、入力項目と結果の意味をまとめています。
          </p>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border bg-background px-4 py-2 text-xs font-semibold shadow-sm transition hover:-translate-y-0.5"
          >
            メインメニューに戻る
          </Link>
        </header>

        <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">入力項目</h2>
          <div className="space-y-4 text-sm">
            {INPUT_SECTIONS.map((item) => (
              <div key={item.title} className="space-y-1">
                <p className="font-semibold">{item.title}</p>
                <p className="text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">結果の見方</h2>
          <div className="space-y-4 text-sm">
            {OUTPUT_SECTIONS.map((item) => (
              <div key={item.title} className="space-y-1">
                <p className="font-semibold">{item.title}</p>
                <p className="text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
