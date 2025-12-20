import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface SliderWithInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
}

export function SliderWithInput({ id, value, onChange, min, max, step, suffix }: SliderWithInputProps) {
  const displayValue = Number.isFinite(value) ? value : min;

  return (
    <div className="space-y-2">
      <Slider
        min={min}
        max={max}
        step={step}
        value={[displayValue]}
        onValueChange={(next) => {
          const nextValue = next[0];
          onChange(Number.isFinite(nextValue) ? nextValue : Number.NaN);
        }}
      />
      <div className="relative">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step}
          onChange={(event) => {
            const nextValue = parseFloat(event.target.value);
            onChange(Number.isNaN(nextValue) ? Number.NaN : nextValue);
          }}
          className={suffix ? "pr-10" : undefined}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}
