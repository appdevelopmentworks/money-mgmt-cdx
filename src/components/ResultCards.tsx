import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercent, formatYen } from "@/lib/format";

interface ResultCardsProps {
  positionNotional: number | null;
  stopPercent: number | null;
  riskAmount: number | null;
}

const YEN_SYMBOL = "\u00a5";

export function ResultCards({ positionNotional, stopPercent, riskAmount }: ResultCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>建玉（投入額）の目安</CardTitle>
          <CardDescription>この金額で建てると、損切り時の損失が設定内に収まる想定です</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">
            {positionNotional == null ? "?" : `${YEN_SYMBOL}${formatYen(positionNotional)}`}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>損切り幅の目安</CardTitle>
          <CardDescription>平均損失に「損切りゆとり」をかけて決めています</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">
            {stopPercent == null ? "?" : `${formatPercent(stopPercent)}%`}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>1回で最大いくら負ける？</CardTitle>
          <CardDescription>資金に対する最大損失（%）もあわせて確認しましょう</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">
            {riskAmount == null ? "?" : `${YEN_SYMBOL}${formatYen(riskAmount)}`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
