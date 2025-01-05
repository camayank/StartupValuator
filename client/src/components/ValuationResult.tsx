import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ValuationData } from "@/lib/validations";

interface ValuationResultProps {
  data: ValuationData | null;
}

export function ValuationResult({ data }: ValuationResultProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Valuation Result</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Fill out the form to see your startup's valuation
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Valuation Result</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-primary">
            {formatCurrency(data.valuation)}
          </h3>
          <p className="text-sm text-muted-foreground">Estimated Valuation</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Revenue Multiple</span>
            <span className="font-medium">{data.multiplier.toFixed(1)}x</span>
          </div>
          <Progress value={Math.min((data.multiplier / 20) * 100, 100)} />
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Valuation Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Base Valuation</span>
              <span>{formatCurrency(data.details.baseValuation)}</span>
            </div>
            {Object.entries(data.details.adjustments).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className={value > 0 ? 'text-green-600' : 'text-red-600'}>
                  {value > 0 ? '+' : ''}{formatCurrency(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
