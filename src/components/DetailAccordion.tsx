import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { formatPercent, formatRatioAsPercent } from "@/lib/format";
import { CalculationOutputs } from "@/lib/types";

interface DetailAccordionProps {
  outputs: CalculationOutputs | null;
}

const CAP_LABELS: Record<CalculationOutputs["active_cap"], string> = {
  kelly: "ケリー抑え",
  floor: "停止ライン",
  user_max: "ユーザー上限",
  none: "制約なし",
};

export function DetailAccordion({ outputs }: DetailAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="details">
        <AccordionTrigger>計算の中身（詳細）</AccordionTrigger>
        <AccordionContent>
          {outputs ? (
            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span>資金に対する1回の最大損失（%）</span>
                <span className="font-medium">{formatRatioAsPercent(outputs.f)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>ペイオフ比（利益÷損失）</span>
                <span className="font-medium">{formatPercent(outputs.b, 2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>期待値（%）</span>
                <span className="font-medium">{formatPercent(outputs.EV_percent, 2)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>想定連敗回数（m）</span>
                <span className="font-medium">{outputs.m_loss_streak}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>ケリー理論値（f_kelly）</span>
                <span className="font-medium">{formatRatioAsPercent(outputs.f_kelly)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>停止ライン上限（f_floor）</span>
                <span className="font-medium">{formatRatioAsPercent(outputs.f_floor)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>どの上限が効いたか</span>
                <Badge variant="secondary">{CAP_LABELS[outputs.active_cap]}</Badge>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">入力に不備があるため計算を停止しています。</p>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
