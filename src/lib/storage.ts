import { CalculationInputsUI, Mode, SavedState } from "@/lib/types";

const STORAGE_VERSION = 1;

export function getStorageKey(mode: Mode): string {
  return mode === "fx" ? "mm_mvp_fx" : "mm_mvp_stock";
}

export function loadState(mode: Mode): Partial<CalculationInputsUI> | null {
  if (typeof window === "undefined") return null;
  const key = getStorageKey(mode);
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedState;
    if (parsed.version !== STORAGE_VERSION || !parsed.inputs) return null;
    return parsed.inputs;
  } catch {
    return null;
  }
}

export function saveState(inputs: CalculationInputsUI): void {
  if (typeof window === "undefined") return;
  const key = getStorageKey(inputs.mode);
  const payload: SavedState = {
    version: STORAGE_VERSION,
    inputs: {
      mode: inputs.mode,
      E0_yen: inputs.E0_yen,
      L_percent: inputs.L_percent,
      N: inputs.N,
      alpha_percent: inputs.alpha_percent,
      k: inputs.k,
      s_loss: inputs.s_loss,
      f_user_max_percent: inputs.f_user_max_percent,
    },
  };
  try {
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Ignore storage failures (quota, privacy mode).
  }
}

export function clearState(mode: Mode): void {
  if (typeof window === "undefined") return;
  const key = getStorageKey(mode);
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures (quota, privacy mode).
  }
}
