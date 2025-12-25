import {
  CalculationInputsNorm,
  CalculationInputsUI,
  CalculationOutputs,
  ValidationResult,
} from "@/lib/types";

export function normalize(ui: CalculationInputsUI): CalculationInputsNorm {
  const L = ui.L_percent / 100;
  const p = ui.p_percent / 100;
  const alpha = ui.alpha_percent / 100;
  const f_user_max = ui.f_user_max_percent / 100;
  const max_dd = ui.max_dd_percent / 100;

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
    max_dd,
    b,
    N: ui.N,
    alpha,
    k: ui.k,
    s_loss: ui.s_loss,
    f_user_max,
  };
}

export function findMinLossStreakM(p: number, N: number, alpha: number): number {
  if (N <= 0) return 1;
  if (alpha <= 0) return Math.max(1, N);
  if (p <= 0) return 1;
  if (p >= 1) return 1;

  const q = 1 - p;
  const maxM = Math.min(200, Math.max(1, N));
  for (let m = 1; m <= maxM; m += 1) {
    const windows = Math.max(1, N - m + 1);
    const bound = windows * Math.pow(q, m);
    if (bound <= alpha) return m;
  }
  return maxM;
}

export function computeRecommendations(norm: CalculationInputsNorm): CalculationOutputs {
  const stop_percent = norm.D * norm.s_loss;

  const b = norm.b;
  const p = norm.p;
  const f_kelly_raw = b > 0 ? p - (1 - p) / b : 0;
  const f_kelly = Math.max(0, f_kelly_raw);
  const f_kelly_cap = norm.k * f_kelly;

  const m = findMinLossStreakM(p, norm.N, norm.alpha);
  const f_floor = 1 - Math.pow(norm.L, 1 / m);

  const f = Math.min(f_kelly_cap, f_floor, norm.f_user_max);

  const useDdRisk = Number.isFinite(norm.max_dd) && norm.max_dd > 0;
  const risk_amount_from_f = f * norm.E0;
  const risk_amount_from_dd = useDdRisk ? norm.max_dd * norm.E0 : Number.POSITIVE_INFINITY;
  const risk_amount_yen = Math.min(risk_amount_from_f, risk_amount_from_dd);
  const position_notional_yen = stop_percent > 0 ? risk_amount_yen / (stop_percent / 100) : 0;

  const EV_percent = p * norm.W - (1 - p) * norm.D;

  const eps = 1e-12;
  const minCap = Math.min(f_kelly_cap, f_floor, norm.f_user_max);
  let active_cap: CalculationOutputs["active_cap"] = "none";
  if (Math.abs(minCap - f_kelly_cap) < eps) active_cap = "kelly";
  if (Math.abs(minCap - f_floor) < eps) active_cap = "floor";
  if (Math.abs(minCap - norm.f_user_max) < eps) active_cap = "user_max";

  return {
    stop_percent,
    position_notional_yen,
    risk_amount_yen,
    risk_amount_source: risk_amount_yen === risk_amount_from_dd ? "dd" : "f",
    f,
    b,
    EV_percent,
    m_loss_streak: m,
    f_kelly,
    f_floor,
    active_cap,
  };
}

export function validate(ui: CalculationInputsUI): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!(ui.E0_yen > 0)) errors.push("はじめの資金（円）は0より大きい値が必要です。");
  if (!(ui.L_percent > 0 && ui.L_percent < 100)) {
    errors.push("停止ライン（%）は0?100の範囲で入力してください。");
  }
  if (!(ui.p_percent > 0 && ui.p_percent < 100)) {
    warnings.push("勝率が極端です。入力値（Backtesting.pyの統計）を確認してください。");
  }
  if (!(ui.W_percent > 0)) errors.push("勝ったときの平均利益（%）は0より大きい値が必要です。");
  if (!(ui.D_percent > 0)) errors.push("負けたときの平均損失（%）は0より大きい値が必要です。");
  if (!(ui.N >= 1)) errors.push("想定トレード回数は1以上で入力してください。");
  if (!(ui.alpha_percent > 0 && ui.alpha_percent < 100)) {
    warnings.push("停止ラインを割る確率の目安（%）は0?100の範囲で入力してください。");
  }
  if (!(ui.k >= 0 && ui.k <= 1)) errors.push("攻めすぎ防止（k）は0?1の範囲で入力してください。");
  if (!(ui.s_loss >= 1)) errors.push("損切りゆとり（s_loss）は1以上で入力してください。");
  if (!(ui.f_user_max_percent > 0 && ui.f_user_max_percent < 100)) {
    errors.push("1回の最大損失（%）は0?100の範囲で入力してください。");
  }

  if (ui.L_percent >= 80) warnings.push("停止ラインが高いと、少しの下落で停止になりやすいです。");
  if (ui.D_percent < 0.1) {
    warnings.push(
      "平均損失が小さすぎる可能性があります。損切りゆとりを上げると安全寄りになります。"
    );
  }

  return { errors, warnings };
}
