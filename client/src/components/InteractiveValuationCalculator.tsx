import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { currencies, sectors, businessStages } from "@/lib/validations";
import type { ValuationFormData } from "@/lib/validations";
import { calculateValuation } from "@/lib/api";
import { Check } from "lucide-react";
import { Link } from "@/components/ui/link";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function InteractiveValuationCalculator() {
  const [formData, setFormData] = useState<Partial<ValuationFormData>>({
    revenue: 1000000,
    currency: "USD",
    growthRate: 20,
    margins: 15,
    sector: "technology",
    stage: "seed",
  });

  const [valuation, setValuation] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleInputChange = (field: keyof ValuationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value: number) => {
    if (!formData.currency) return '$0';
    const config = {
      USD: { symbol: "$", locale: "en-US" },
      EUR: { symbol: "€", locale: "de-DE" },
      GBP: { symbol: "£", locale: "en-GB" },
    }[formData.currency] || { symbol: "$", locale: "en-US" };

    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: formData.currency,
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(value);
  };

  useEffect(() => {
    const calculateValue = async () => {
      // Only calculate if we have the minimum required fields
      if (!formData.revenue || !formData.growthRate || !formData.margins) return;

      setIsCalculating(true);
      try {
        const result = await calculateValuation(formData as ValuationFormData);
        setValuation(result);
      } catch (error) {
        console.error('Calculation error:', error);
      } finally {
        setIsCalculating(false);
      }
    };

    // Debounce the calculation to prevent too many API calls
    const timer = setTimeout(calculateValue, 500);
    return () => clearTimeout(timer);
  }, [formData]);

  const breakdownData = valuation ? [
    { name: "Base Value", value: valuation.details.baseValuation },
    ...(valuation.details.adjustments ?
      Object.entries(valuation.details.adjustments).map(([key, value]) => ({
        name: key.replace(/([A-Z])/g, ' $1').trim(),
        value: Math.abs(Number(value)),
        isPositive: Number(value) > 0,
      })) : []
    ),
  ] : [];

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Valuation Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Annual Revenue</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.revenue}
                    onChange={(e) => handleInputChange('revenue', Number(e.target.value))}
                    className="pl-8"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {currencies[formData.currency as keyof typeof currencies]?.symbol || '$'}
                  </span>
                </div>
              </div>

              <div>
                <Label>Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => handleInputChange('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(currencies).map(([code, { name, symbol }]) => (
                      <SelectItem key={code} value={code}>
                        {symbol} - {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Growth Rate (%)</Label>
                <Input
                  type="number"
                  value={formData.growthRate}
                  onChange={(e) => handleInputChange('growthRate', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Operating Margins (%)</Label>
                <Input
                  type="number"
                  value={formData.margins}
                  onChange={(e) => handleInputChange('margins', Number(e.target.value))}
                />
              </div>

              <div>
                <Label>Sector</Label>
                <Select
                  value={formData.sector}
                  onValueChange={(value) => handleInputChange('sector', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(sectors).map(([key, { name }]) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Stage</Label>
                <Select
                  value={formData.stage}
                  onValueChange={(value) => handleInputChange('stage', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(businessStages).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {valuation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Valuation Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Bar Chart */}
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={breakdownData} layout="vertical">
                        <XAxis type="number" tickFormatter={formatCurrency} />
                        <YAxis type="category" dataKey="name" width={150} />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                          }}
                        />
                        <Bar
                          dataKey="value"
                          fill="hsl(var(--primary))"
                          opacity={0.8}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Pie Chart */}
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={breakdownData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          label
                        >
                          {breakdownData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Add CTA for full features */}
                <div className="mt-8 p-4 bg-primary/5 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">
                    Want More Detailed Analysis?
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Sign up for full access to:
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Comprehensive valuation reports</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Industry-specific metrics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Growth potential analysis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Expert valuation guidance</span>
                    </li>
                  </ul>
                  <Link href="/auth?mode=signup">
                    <Button className="w-full md:w-auto">
                      Get Full Access
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}