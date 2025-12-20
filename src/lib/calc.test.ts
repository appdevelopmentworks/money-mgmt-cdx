/// <reference types="vitest" />

import { computeRecommendations, findMinLossStreakM, normalize } from "@/lib/calc";
import { CalculationInputsUI } from "@/lib/types";

test("computeRecommendations returns finite values", () => {
  const ui: CalculationInputsUI = {
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

  const outputs = computeRecommendations(normalize(ui));
  expect(Number.isFinite(outputs.stop_percent)).toBe(true);
  expect(Number.isFinite(outputs.position_notional_yen)).toBe(true);
  expect(Number.isFinite(outputs.risk_amount_yen)).toBe(true);
  expect(Number.isFinite(outputs.f)).toBe(true);
});

test("position_notional decreases as stop% increases", () => {
  const base: CalculationInputsUI = {
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

  const lowStop = computeRecommendations(normalize({ ...base, s_loss: 1.0 }));
  const highStop = computeRecommendations(normalize({ ...base, s_loss: 1.5 }));

  expect(highStop.stop_percent).toBeGreaterThan(lowStop.stop_percent);
  expect(highStop.position_notional_yen).toBeLessThan(lowStop.position_notional_yen);
});

test("findMinLossStreakM returns within expected range", () => {
  const m = findMinLossStreakM(0.5, 200, 0.005);
  expect(m).toBeGreaterThanOrEqual(1);
  expect(m).toBeLessThanOrEqual(200);
});
