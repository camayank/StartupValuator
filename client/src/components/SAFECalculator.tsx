import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/validations";

interface SAFECalculatorProps {
  onCalculate?: (result: SAFECalculationResult) => void;
}

interface SAFECalculationResult {
  preMoneyValuation: number;
  investmentAmount: number;
  postMoneyValuation: number;
  ownershipPercentage: number;
  founderEquity: number;
  investorEquity: number;
  safeHolderEquity: number;
}

export function SAFECalculator({ onCalculate }: SAFECalculatorProps) {
  const [discount, setDiscount] = useState<number>(20);
  const [cap, setCap] = useState<number>(5000000);
  const [investment, setInvestment] = useState<number>(160000);
  const [preMoneyValuation, setPreMoneyValuation] = useState<number>(5500000);
  const [investmentAmount, setInvestmentAmount] = useState<number>(2000000);

  const calculateSAFE = () => {
    const postMoneyValuation = preMoneyValuation + investmentAmount;
    const effectivePrice = Math.min(
      cap,
      preMoneyValuation * (1 - discount / 100)
    );
    
    const safeShares = investment / effectivePrice * postMoneyValuation;
    const totalShares = postMoneyValuation;
    
    const safePercentage = (safeShares / totalShares) * 100;
    const investorPercentage = (investmentAmount / postMoneyValuation) * 100;
    const founderPercentage = 100 - safePercentage - investorPercentage;

    const result: SAFECalculationResult = {
      preMoneyValuation,
      investmentAmount,
      postMoneyValuation,
      ownershipPercentage: safePercentage,
      founderEquity: founderPercentage,
      investorEquity: investorPercentage,
      safeHolderEquity: safePercentage,
    };

    onCalculate?.(result);
    return result;
  };

  const result = calculateSAFE();
  const capTableData = [
    { name: "Founders", value: result.founderEquity },
    { name: "New Investors", value: result.investorEquity },
    { name: "SAFE Holders", value: result.safeHolderEquity },
  ];

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Calculate SAFE conversion and visualize cap table impact.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-lg font-semibold mb-4">SAFE Agreement</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Discount (%)</label>
                <Slider
                  value={[discount]}
                  onValueChange={([value]) => setDiscount(value)}
                  max={100}
                  step={1}
                />
                <div className="text-sm text-muted-foreground">{discount}%</div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cap</label>
                <Input
                  type="number"
                  value={cap}
                  onChange={(e) => setCap(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Investment</label>
                <Input
                  type="number"
                  value={investment}
                  onChange={(e) => setInvestment(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-lg font-semibold mb-4">Conversion Round</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pre-money Valuation</label>
                <Input
                  type="number"
                  value={preMoneyValuation}
                  onChange={(e) => setPreMoneyValuation(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Investment Amount</label>
                <Input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="text-sm space-y-1">
                <p><strong>Post-money Valuation:</strong> {formatCurrency(result.postMoneyValuation)}</p>
                <p><strong>SAFE Holder Ownership:</strong> {result.safeHolderEquity.toFixed(2)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Resulting cap-table</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={capTableData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                fill="#8884d8"
                label={({ name, value }) => `${name}: ${value.toFixed(2)}%`}
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
