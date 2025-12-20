"use client";

import { useEffect, useMemo, useState } from "react";

import { Alerts } from "@/components/Alerts";
import { DetailAccordion } from "@/components/DetailAccordion";
import { Field } from "@/components/Field";
import { MoneyInput } from "@/components/MoneyInput";
import { PercentInput } from "@/components/PercentInput";
import { ResultCards } from "@/components/ResultCards";
import { SliderWithInput } from "@/components/SliderWithInput";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { computeRecommendations, normalize, validate } from "@/lib/calc";
import { getDefaultsForMode } from "@/lib/defaults";
import { loadState, saveState } from "@/lib/storage";
import type { CalculationInputsUI, Mode } from "@/lib/types";

type ThemeMode = "light" | "dark";

const MODE_LABELS: Record<Mode, string> = {
  stock: "優待イベント投資（株）",
  fx: "先物・FX（Backtesting.py）",
};

const THEME_STORAGE_KEY = "mm_mvp_theme";

function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // Ignore storage failures.
  }
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export default function Page() {
  const [mode, setMode] = useState<Mode>("stock");
  const [inputs, setInputs] = useState<CalculationInputsUI>(getDefaultsForMode("stock"));
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage failures.
    }
  }, [theme]);

  useEffect(() => {
    const stored = loadState(mode);
    setInputs(stored ?? getDefaultsForMode(mode));
  }, [mode]);

  useEffect(() => {
    const id = window.setTimeout(() => saveState(inputs), 250);
    return () => window.clearTimeout(id);
  }, [inputs]);

  const validation = useMemo(() => validate(inputs), [inputs]);

  const outputs = useMemo(() => {
    if (validation.errors.length > 0) return null;
    return computeRecommendations(normalize(inputs));
  }, [inputs, validation.errors.length]);

  const update = <K extends keyof CalculationInputsUI>(key: K, value: CalculationInputsUI[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,hsl(var(--primary)_/_0.18),transparent_55%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background)))]">
      <div className="mx-auto w-full max-w-3xl space-y-8 p-4 md:p-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">資金管理MVP</p>
            <h1 className="text-2xl font-bold md:text-3xl">建玉と損切りのおすすめ計算</h1>
            <p className="text-sm text-muted-foreground">
              勝率と平均損益から、無理のない1回の取引量を提案します
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
            className="shrink-0 rounded-full border bg-background px-4 py-2 text-xs font-semibold shadow-sm transition hover:-translate-y-0.5"
            aria-label="テーマ切り替え"
          >
            {theme === "dark" ? "ライトモード" : "ダークモード"}
          </button>
        </header>

        <section className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold">モード</p>
            <p className="text-xs text-muted-foreground">モードによって初期設定（安全寄り度合い）が変わります</p>
          </div>
          <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)}>
            <TabsList className="w-full">
              <TabsTrigger value="stock" className="w-full">
                {MODE_LABELS.stock}
              </TabsTrigger>
              <TabsTrigger value="fx" className="w-full">
                {MODE_LABELS.fx}
              </TabsTrigger>
            </TabsList>
            <TabsContent value={mode}>
              <div className="space-y-6">
                <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
                  <h2 className="text-lg font-semibold">基本入力（必須）</h2>
                  <div className="grid gap-4">
                    <Field
                      id="E0_yen"
                      label="はじめの資金（円）"
                      helperText="運用を始める元手です"
                      tooltip="この金額を基準に、1回で許容する損失（円）と建玉額を計算します"
                    >
                      <MoneyInput
                        value={inputs.E0_yen}
                        onChange={(value) => update("E0_yen", value)}
                        min={1}
                        step={1000}
                        placeholder="1000000"
                      />
                    </Field>
                    <Field
                      id="L_percent"
                      label="停止ライン（%）"
                      helperText="資金がここを下回ったら停止します"
                      tooltip="資金が「はじめの資金×この%」を下回ったら、運用停止（強制終了）とみなします。高すぎるとすぐ停止しやすく、低すぎると大きな損失を許容する設定になります。"
                    >
                      <SliderWithInput
                        value={inputs.L_percent}
                        onChange={(value) => update("L_percent", value)}
                        min={10}
                        max={90}
                        step={1}
                        suffix="%"
                      />
                    </Field>
                    <Field
                      id="p_percent"
                      label="勝率（%）"
                      helperText="1回の取引が勝つ割合です"
                      tooltip="Backtesting.pyのWin Rate（%）に近い値を入れてください"
                    >
                      <PercentInput
                        value={inputs.p_percent}
                        onChange={(value) => update("p_percent", value)}
                        min={1}
                        step={0.1}
                        placeholder="55"
                      />
                    </Field>
                    <Field
                      id="W_percent"
                      label="勝ったときの平均利益（%）"
                      helperText="勝ったときに平均で何%増えるか"
                      tooltip="「1トレードあたりの%」として入力してください（複利・レバ込みの結果でもOK）"
                    >
                      <PercentInput
                        value={inputs.W_percent}
                        onChange={(value) => update("W_percent", value)}
                        min={0.01}
                        step={0.1}
                        placeholder="1.8"
                      />
                    </Field>
                    <Field
                      id="D_percent"
                      label="負けたときの平均損失（%）"
                      helperText="負けたときに平均で何%減るか（正の数）"
                      tooltip="マイナス記号は不要です。例：-1.2%なら「1.2」と入力します"
                    >
                      <PercentInput
                        value={inputs.D_percent}
                        onChange={(value) => update("D_percent", value)}
                        min={0.01}
                        step={0.1}
                        placeholder="1.2"
                      />
                    </Field>
                  </div>
                </section>

                <Accordion type="single" collapsible className="w-full rounded-2xl border bg-card px-5">
                  <AccordionItem value="advanced">
                    <AccordionTrigger>詳細設定</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-4">
                        <Field
                          id="N"
                          label="想定トレード回数（回）"
                          helperText="この回数の中で起きそうな連敗を見積もります"
                          tooltip="回数が多いほど「長い連敗が起きる前提」になり、安全寄りの推奨になりやすいです"
                        >
                          <Input
                            id="N"
                            type="number"
                            inputMode="numeric"
                            value={Number.isFinite(inputs.N) ? inputs.N : ""}
                            onChange={(event) => {
                              const next = parseFloat(event.target.value);
                              update("N", Number.isNaN(next) ? Number.NaN : Math.max(1, Math.round(next)));
                            }}
                            min={1}
                            step={1}
                            placeholder="200"
                          />
                        </Field>
                        <Field
                          id="alpha_percent"
                          label="停止ラインを割る確率の目安（%）"
                          helperText="小さいほど安全寄り"
                          tooltip="これは“保証”ではなく目安です。入力値を使って、想定連敗を保守的に見積もるために使います"
                        >
                          <PercentInput
                            value={inputs.alpha_percent}
                            onChange={(value) => update("alpha_percent", value)}
                            min={0.1}
                            step={0.1}
                            placeholder="1.0"
                          />
                        </Field>
                        <Field
                          id="k"
                          label="攻めすぎ防止（成長の理論値を抑える）"
                          helperText="小さいほど安全寄り"
                          tooltip="理論上の最適（ケリー）をそのまま使うとリスクが大きくなりがちなので、控えめにするための係数です"
                        >
                          <SliderWithInput
                            value={inputs.k}
                            onChange={(value) => update("k", value)}
                            min={0.05}
                            max={0.5}
                            step={0.01}
                          />
                        </Field>
                        <Field
                          id="s_loss"
                          label="損切りゆとり（平均損失に上乗せ）"
                          helperText="平均損失より少し広めに損切りを見積もります"
                          tooltip="平均損失は“たまたま小さく見える”ことがあります。少しゆとりを持たせることで、過度な建玉になりにくくします"
                        >
                          <SliderWithInput
                            value={inputs.s_loss}
                            onChange={(value) => update("s_loss", value)}
                            min={1.0}
                            max={2.0}
                            step={0.05}
                          />
                        </Field>
                        <Field
                          id="f_user_max_percent"
                          label="1回の最大損失（資金に対して%）"
                          helperText="どんな場合でも、1回でこれ以上は失わない上限"
                          tooltip="計算結果が大きく出ても、この上限を超えないように抑えます"
                        >
                          <PercentInput
                            value={inputs.f_user_max_percent}
                            onChange={(value) => update("f_user_max_percent", value)}
                            min={0.01}
                            step={0.05}
                            placeholder="0.3"
                          />
                        </Field>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <section className="space-y-4">
          <Alerts errors={validation.errors} warnings={validation.warnings} />
          <ResultCards
            positionNotional={outputs?.position_notional_yen ?? null}
            stopPercent={outputs?.stop_percent ?? null}
            riskAmount={outputs?.risk_amount_yen ?? null}
          />
          <DetailAccordion outputs={outputs} />
          <div className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">
            この推奨は利益や安全を保証するものではありません。入力値と相場状況により結果は変わります。
          </div>
        </section>
      </div>
    </main>
  );
}
