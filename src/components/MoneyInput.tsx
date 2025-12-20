import { Input } from "@/components/ui/input";

interface MoneyInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
  placeholder?: string;
}

export function MoneyInput({ id, value, onChange, min, step, placeholder }: MoneyInputProps) {
  return (
    <div className="relative">
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        value={Number.isFinite(value) ? value : ""}
        onChange={(event) => {
          const next = parseFloat(event.target.value);
          onChange(Number.isNaN(next) ? Number.NaN : next);
        }}
        min={min}
        step={step}
        placeholder={placeholder}
        className="pr-10"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
        円
      </span>
    </div>
  );
}
