export function formatYen(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return Math.round(value).toLocaleString("ja-JP");
}

export function formatPercent(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "-";
  return value.toFixed(digits);
}

export function formatRatioAsPercent(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "-";
  return (value * 100).toFixed(digits);
}
