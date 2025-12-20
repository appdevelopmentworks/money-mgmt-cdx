import { computeRecommendations, findMinLossStreakM, normalize } from "@/lib/calc";
import { CalculationInputsUI } from "@/lib/types";
import { expect, test } from "vitest";

const BASE_INPUT: CalculationInputsUI = {
  mode: "stock",
  E0_yen: 1000000,
  L_percent: 50,
  p_percent: 55,
  W_percent: 1.8,
  D_percent: 1.2,
  N: 60,
  alpha_percent: 1.0,
  k: 0.25,
  s_loss: 1.1,
  f_user_max_percent: 1.0,
};

test("正常系: 出力が有限", () => {
  const outputs = computeRecommendations(normalize(BASE_INPUT));
  expect(Number.isFinite(outputs.stop_percent)).toBe(true);
  expect(Number.isFinite(outputs.position_notional_yen)).toBe(true);
  expect(Number.isFinite(outputs.risk_amount_yen)).toBe(true);
  expect(Number.isFinite(outputs.f)).toBe(true);
});

test("反比例: stop_percentを2倍にすると建玉が約1/2", () => {
  const lowStop = computeRecommendations(normalize({ ...BASE_INPUT, s_loss: 1.0 }));
  const highStop = computeRecommendations(normalize({ ...BASE_INPUT, s_loss: 2.0 }));
  const ratio = highStop.position_notional_yen / lowStop.position_notional_yen;

  expect(lowStop.stop_percent).toBeGreaterThan(0);
  expect(highStop.stop_percent).toBeCloseTo(lowStop.stop_percent * 2, 6);
  expect(ratio).toBeCloseTo(0.5, 2);
});

test("m探索: p=0.5,N=200,alpha=0.005で範囲内", () => {
  const m = findMinLossStreakM(0.5, 200, 0.005);
  expect(m).toBeGreaterThanOrEqual(1);
  expect(m).toBeLessThanOrEqual(200);
});

test("クリップ: f_user_maxが極小ならfはそれ以下", () => {
  const outputs = computeRecommendations(
    normalize({
      ...BASE_INPUT,
      f_user_max_percent: 0.05,
      k: 0.5,
    })
  );
  expect(outputs.f).toBeLessThanOrEqual(0.0005);
});
