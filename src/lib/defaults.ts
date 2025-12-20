import { CalculationInputsUI, Mode } from "@/lib/types";

const BASE_DEFAULTS = {
  E0_yen: 1000000,
  L_percent: 50,
  p_percent: 55,
  W_percent: 1.8,
  D_percent: 1.2,
};

export const DEFAULTS_STOCK: CalculationInputsUI = {
  mode: "stock",
  ...BASE_DEFAULTS,
  N: 60,
  alpha_percent: 1.0,
  k: 0.25,
  s_loss: 1.1,
  f_user_max_percent: 1.0,
};

export const DEFAULTS_FX: CalculationInputsUI = {
  mode: "fx",
  ...BASE_DEFAULTS,
  N: 200,
  alpha_percent: 0.5,
  k: 0.1,
  s_loss: 1.2,
  f_user_max_percent: 0.3,
};

export function getDefaultsForMode(mode: Mode): CalculationInputsUI {
  return mode === "fx" ? DEFAULTS_FX : DEFAULTS_STOCK;
}
