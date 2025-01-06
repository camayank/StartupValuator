import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

interface SAFECalculation {
  ownership: number;
  effectivePrice: number;
  dilutedShares: number;
}

export default function SAFECalculatorPage() {
  const [safeType, setSafeType] = useState<"cap" | "discount" | "mfn">("cap");
  const [investment, setInvestment] = useState<number>(0);
  const [valCap, setValCap] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(20);
  const [preMoneyValuation, setPreMoneyValuation] = useState<number>(0);
  const [existingShares, setExistingShares] = useState<number>(1000000);
  
  const [result, setResult] = useState<SAFECalculation | null>(null);

  const calculateSAFE = () => {
    let calculation: SAFECalculation = {
      ownership: 0,
      effectivePrice: 0,
      dilutedShares: existingShares
    };

    const pricePerShare = preMoneyValuation / existingShares;

    switch (safeType) {
      case "cap":
        if (valCap && valCap < preMoneyValuation) {
          const capPrice = valCap / existingShares;
          calculation.effectivePrice = capPrice;
          const safeShares = investment / capPrice;
          calculation.dilutedShares = existingShares + safeShares;
          calculation.ownership = (safeShares / calculation.dilutedShares) * 100;
        } else {
          calculation.effectivePrice = pricePerShare;
          const safeShares = investment / pricePerShare;
          calculation.dilutedShares = existingShares + safeShares;
          calculation.ownership = (safeShares / calculation.dilutedShares) * 100;
        }
        break;

      case "discount":
        const discountedPrice = pricePerShare * (1 - discount / 100);
        calculation.effectivePrice = discountedPrice;
        const discountShares = investment / discountedPrice;
        calculation.dilutedShares = existingShares + discountShares;
        calculation.ownership = (discountShares / calculation.dilutedShares) * 100;
        break;

      case "mfn":
        // Most Favored Nation terms typically convert at the terms of the next priced round
        calculation.effectivePrice = pricePerShare;
        const mfnShares = investment / pricePerShare;
        calculation.dilutedShares = existingShares + mfnShares;
        calculation.ownership = (mfnShares / calculation.dilutedShares) * 100;
        break;
    }

    setResult(calculation);
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            SAFE Calculator
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-5 w-5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Simple Agreement for Future Equity (SAFE) calculator helps estimate
                    potential ownership based on different conversion scenarios.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>SAFE Type</Label>
              <Select value={safeType} onValueChange={(value: "cap" | "discount" | "mfn") => setSafeType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cap">Valuation Cap</SelectItem>
                  <SelectItem value="discount">Discount</SelectItem>
                  <SelectItem value="mfn">Most Favored Nation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Investment Amount ($)</Label>
              <Input
                type="number"
                min="0"
                value={investment}
                onChange={(e) => setInvestment(Number(e.target.value))}
              />
            </div>

            {safeType === "cap" && (
              <div className="space-y-2">
                <Label>Valuation Cap ($)</Label>
                <Input
                  type="number"
                  min="0"
                  value={valCap}
                  onChange={(e) => setValCap(Number(e.target.value))}
                />
              </div>
            )}

            {safeType === "discount" && (
              <div className="space-y-2">
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Pre-Money Valuation ($)</Label>
              <Input
                type="number"
                min="0"
                value={preMoneyValuation}
                onChange={(e) => setPreMoneyValuation(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Existing Shares</Label>
              <Input
                type="number"
                min="0"
                value={existingShares}
                onChange={(e) => setExistingShares(Number(e.target.value))}
              />
            </div>

            <Button className="w-full" onClick={calculateSAFE}>
              Calculate
            </Button>

            {result && (
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Ownership Percentage</Label>
                      <p className="text-2xl font-bold">{result.ownership.toFixed(2)}%</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Effective Price Per Share</Label>
                      <p className="text-2xl font-bold">${result.effectivePrice.toFixed(4)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Total Diluted Shares</Label>
                      <p className="text-2xl font-bold">{result.dilutedShares.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
