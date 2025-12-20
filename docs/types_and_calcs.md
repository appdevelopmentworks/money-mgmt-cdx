# TS型定義・計算関数（MVP仕様）
**方針**: UIと切り離した純関数で実装し、UIはその入出力を表示するだけにする。

---

## 1) 型定義（TypeScript）

### 1.1 モード
```ts
export type Mode = "stock" | "fx";
```

### 1.2 入力（UIで保持する形：%は“人間向け”）
```ts
export interface CalculationInputsUI {
  mode: Mode;

  // 基本入力
  E0_yen: number;              // はじめの資金（円）
  L_percent: number;           // 停止ライン（%）例: 50
  p_percent: number;           // 勝率（%）例: 55
  W_percent: number;           // 勝ったときの平均利益（%）
  D_percent: number;           // 負けたときの平均損失（%）※正の値

  // 詳細（任意・デフォあり）
  N: number;                   // 想定トレード回数
  alpha_percent: number;       // 停止ラインを割る確率の目安（%）
  k: number;                   // ケリー抑制（0〜1）
  s_loss: number;              // 損失安全倍率（>=1）
  f_user_max_percent: number;  // 1回の最大損失（資金に対して%）例: 0.3
}
```

### 1.3 計算用に正規化（内部は0〜1の比率に統一）
```ts
export interface CalculationInputsNorm {
  mode: Mode;

  E0: number;     // yen
  L: number;      // 0〜1
  p: number;      // 0〜1
  W: number;      // percent (e.g. 1.8 means 1.8%)
  D: number;      // percent (positive)
  b: number;      // W/D

  N: number;
  alpha: number;  // 0〜1
  k: number;      // 0〜1
  s_loss: number; // >=1
  f_user_max: number; // 0〜1
}
```

### 1.4 出力
```ts
export interface CalculationOutputs {
  stop_percent: number;        // 推奨損切り幅（%）
  position_notional_yen: number; // 推奨建玉（円）
  risk_amount_yen: number;     // 1回の最大損失額（円）
  f: number;                   // 資金に対する1回の最大損失率（0〜1）
  b: number;                   // ペイオフ比
  EV_percent: number;          // 期待値（%）

  // 透明性のため
  m_loss_streak: number;       // 想定連敗（負け）回数
  f_kelly: number;             // ケリー（0〜1）
  f_floor: number;             // 停止ライン上限（0〜1）
  active_cap: "kelly" | "floor" | "user_max" | "none"; // どの上限が効いたか
}
```

### 1.5 バリデーション結果
```ts
export interface ValidationResult {
  errors: string[];   // 計算不可
  warnings: string[]; // 計算はするが注意
}
```

---

## 2) 正規化・丸め

### 2.1 正規化
```ts
export function normalize(ui: CalculationInputsUI): CalculationInputsNorm {
  const L = ui.L_percent / 100;
  const p = ui.p_percent / 100;
  const alpha = ui.alpha_percent / 100;
  const f_user_max = ui.f_user_max_percent / 100;

  const W = ui.W_percent;
  const D = ui.D_percent;
  const b = D > 0 ? W / D : Number.POSITIVE_INFINITY;

  return {
    mode: ui.mode,
    E0: ui.E0_yen,
    L,
    p,
    W,
    D,
    b,
    N: ui.N,
    alpha,
    k: ui.k,
    s_loss: ui.s_loss,
    f_user_max,
  };
}
```

### 2.2 表示用丸め（例）
- 円：`Math.round(value)` または `Math.round(value / 1000) * 1000`
- %：小数2桁など（`toFixed(2)`）

---

## 3) 計算関数（疑似コード）

### 3.1 m探索（保守近似）
**目標**: `(N - m + 1) * (1 - p)^m <= alpha` を満たす最小 `m`

```ts
export function findMinLossStreakM(p: number, N: number, alpha: number): number {
  // ガード
  if (N <= 0) return 1;
  if (alpha <= 0) return Math.max(1, N); // ほぼ不可能→最大側
  if (p <= 0) return 1; // 常に負ける想定
  if (p >= 1) return 1; // 常に勝つ想定

  const q = 1 - p;
  const maxM = Math.min(200, N); // MVP上限
  for (let m = 1; m <= maxM; m++) {
    const windows = Math.max(1, N - m + 1);
    const bound = windows * Math.pow(q, m);
    if (bound <= alpha) return m;
  }
  return maxM; // 見つからなければ保守的に最大
}
```

### 3.2 推奨値の計算
```ts
export function computeRecommendations(norm: CalculationInputsNorm): CalculationOutputs {
  // 1) stop%
  const stop_percent = norm.D * norm.s_loss; // Dは%なので、そのまま%

  // 2) ケリー（上限目安）
  const b = norm.b;
  const p = norm.p;

  const f_kelly_raw = (b > 0) ? (p - (1 - p) / b) : 0;
  const f_kelly = Math.max(0, f_kelly_raw);
  const f_kelly_cap = norm.k * f_kelly;

  // 3) 停止ライン上限
  const m = findMinLossStreakM(p, norm.N, norm.alpha);
  const f_floor = 1 - Math.pow(norm.L, 1 / m);

  // 4) 最終f
  const f = Math.min(f_kelly_cap, f_floor, norm.f_user_max);

  // 5) 建玉
  const risk_amount_yen = f * norm.E0;
  const position_notional_yen =
    stop_percent > 0 ? (risk_amount_yen / (stop_percent / 100)) : 0;

  // 6) 期待値（%）
  const EV_percent = (p * norm.W) - ((1 - p) * norm.D);

  // 7) どの上限が効いたか
  const eps = 1e-12;
  let active_cap: CalculationOutputs["active_cap"] = "none";
  const minCap = Math.min(f_kelly_cap, f_floor, norm.f_user_max);
  if (Math.abs(minCap - f_kelly_cap) < eps) active_cap = "kelly";
  if (Math.abs(minCap - f_floor) < eps) active_cap = "floor";
  if (Math.abs(minCap - norm.f_user_max) < eps) active_cap = "user_max";

  return {
    stop_percent,
    position_notional_yen,
    risk_amount_yen,
    f,
    b,
    EV_percent,
    m_loss_streak: m,
    f_kelly,
    f_floor,
    active_cap,
  };
}
```

---

## 4) バリデーション（最小）
```ts
export function validate(ui: CalculationInputsUI): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!(ui.E0_yen > 0)) errors.push("はじめの資金（円）は0より大きい値が必要です。");
  if (!(ui.L_percent > 0 && ui.L_percent < 100)) errors.push("停止ライン（%）は0〜100の範囲で入力してください。");
  if (!(ui.p_percent > 0 && ui.p_percent < 100)) warnings.push("勝率が極端です。入力値（統計）を確認してください。");
  if (!(ui.W_percent > 0)) errors.push("勝ったときの平均利益（%）は0より大きい値が必要です。");
  if (!(ui.D_percent > 0)) errors.push("負けたときの平均損失（%）は0より大きい値が必要です。");
  if (!(ui.N >= 1)) errors.push("想定トレード回数は1以上で入力してください。");
  if (!(ui.alpha_percent > 0 && ui.alpha_percent < 100)) warnings.push("停止ラインを割る確率の目安（%）は0〜100の範囲で入力してください。");
  if (!(ui.k >= 0 && ui.k <= 1)) errors.push("攻めすぎ防止（k）は0〜1の範囲で入力してください。");
  if (!(ui.s_loss >= 1)) errors.push("損切りゆとり（s_loss）は1以上で入力してください。");
  if (!(ui.f_user_max_percent > 0 && ui.f_user_max_percent < 100)) errors.push("1回の最大損失（%）は0〜100の範囲で入力してください。");

  // 追加警告
  if (ui.L_percent >= 80) warnings.push("停止ラインが高いと、少しの下落で停止になりやすいです。");
  if (ui.D_percent < 0.1) warnings.push("平均損失が小さすぎる可能性があります。損切りゆとりを上げると安全寄りになります。");

  return { errors, warnings };
}
```

---

## 5) デフォルト値（モード別）
```ts
export const DEFAULTS_STOCK = {
  N: 60,
  alpha_percent: 1.0,
  k: 0.25,
  s_loss: 1.10,
  f_user_max_percent: 1.0,
};

export const DEFAULTS_FX = {
  N: 200,
  alpha_percent: 0.5,
  k: 0.10,
  s_loss: 1.20,
  f_user_max_percent: 0.3,
};
```
