export type Mode = "stock" | "fx";

export interface CalculationInputsUI {
  mode: Mode;
  E0_yen: number;
  L_percent: number;
  p_percent: number;
  W_percent: number;
  D_percent: number;
  N: number;
  alpha_percent: number;
  k: number;
  s_loss: number;
  f_user_max_percent: number;
}

export interface CalculationInputsNorm {
  mode: Mode;
  E0: number;
  L: number;
  p: number;
  W: number;
  D: number;
  b: number;
  N: number;
  alpha: number;
  k: number;
  s_loss: number;
  f_user_max: number;
}

export interface CalculationOutputs {
  stop_percent: number;
  position_notional_yen: number;
  risk_amount_yen: number;
  f: number;
  b: number;
  EV_percent: number;
  m_loss_streak: number;
  f_kelly: number;
  f_floor: number;
  active_cap: "kelly" | "floor" | "user_max" | "none";
}

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

export interface SavedState {
  version: 1;
  inputs: CalculationInputsUI;
}
