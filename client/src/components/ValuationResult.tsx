import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ValuationData } from "@/lib/validations";
import { generateReport } from "@/lib/api";
import { RiskAssessment } from "./RiskAssessment";

interface ValuationResultProps {
  data: ValuationData | null;
}

export function ValuationResult({ data }: ValuationResultProps) {
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    if (!data) return;

    try {
      const response = await generateReport(data);
      // Create a blob from the PDF data and open in new tab
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  };

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
    <div className="space-y-6">
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

          <Button 
            className="w-full" 
            onClick={handleGenerateReport}
            variant="outline"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Professional Report
          </Button>
        </CardContent>
      </Card>

      {data.riskAssessment && (
        <RiskAssessment data={data.riskAssessment} />
      )}
    </div>
  );
}