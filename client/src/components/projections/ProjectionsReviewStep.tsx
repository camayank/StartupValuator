import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import type { FinancialProjectionData } from "@/lib/validations";
import { formatCurrency } from "@/lib/validations";
import { motion } from "framer-motion";

interface ProjectionsReviewStepProps {
  data: Partial<FinancialProjectionData>;
  onUpdate: (data: Partial<FinancialProjectionData>) => void;
  onSubmit: (data: FinancialProjectionData) => void;
  onBack: () => void;
}

export function ProjectionsReviewStep({
  data,
  onUpdate,
  onSubmit,
  onBack,
}: ProjectionsReviewStepProps) {
  const handleSubmit = () => {
    // Ensure all required data is present
    if (!data.baseRevenue || !data.baseExpenses || !data.growthRate) {
      return;
    }
    onSubmit(data as FinancialProjectionData);
  };

  // Calculate projected values
  const projectionYears = data.projectionPeriod || 3;
  const projections = Array.from({ length: projectionYears }, (_, year) => {
    const growthMultiplier = Math.pow(1 + (data.growthRate || 0) / 100, year + 1);
    const projectedRevenue = (data.baseRevenue || 0) * growthMultiplier;
    const projectedExpenses = (data.baseExpenses || 0) * (1 + year * 0.1); // Assuming 10% yearly increase in expenses
    return {
      year: year + 1,
      revenue: projectedRevenue,
      expenses: projectedExpenses,
      profit: projectedRevenue - projectedExpenses,
    };
  });

  // Calculate runway
  const monthlyBurnRate = data.burnRate || 0;
  const runway = monthlyBurnRate > 0 ? Math.floor((data.totalFunding || 0) / monthlyBurnRate) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Review your financial projections and fund utilization plan before generating the final report.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Financial Projections</h3>
            <div className="space-y-4">
              {projections.map((projection) => (
                <div
                  key={projection.year}
                  className="grid grid-cols-4 gap-4 p-4 border rounded-lg"
                >
                  <div>
                    <p className="text-sm text-muted-foreground">Year {projection.year}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {formatCurrency(projection.revenue)}
                    </p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {formatCurrency(projection.expenses)}
                    </p>
                    <p className="text-xs text-muted-foreground">Expenses</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {formatCurrency(projection.profit)}
                    </p>
                    <p className="text-xs text-muted-foreground">Profit/Loss</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Fund Utilization Summary</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Funding</p>
                  <p className="text-lg font-medium">
                    {formatCurrency(data.totalFunding || 0)}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Monthly Burn Rate</p>
                  <p className="text-lg font-medium">
                    {formatCurrency(monthlyBurnRate)}
                  </p>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Estimated Runway</p>
                <p className="text-lg font-medium">{runway} months</p>
              </div>
            </div>
          </div>

          {data.allocation && data.allocation.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Fund Allocation</h3>
              <div className="space-y-2">
                {data.allocation.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{item.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.percentage}% | {formatCurrency(item.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit}>
          Generate Report
        </Button>
      </div>
    </motion.div>
  );
}
