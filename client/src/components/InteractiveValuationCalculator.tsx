import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Check, HelpCircle } from "lucide-react";
import { Link } from "@/components/ui/link";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

// Default values that match our validation schema
const defaultValues: Partial<ValuationFormData> = {
  revenue: 1000000,
  currency: "USD",
  growthRate: 20,
  margins: 15,
  sector: "technology",
  stage: "revenue_early",
};

export function InteractiveValuationCalculator() {
  const [formData, setFormData] = useState<Partial<ValuationFormData>>(defaultValues);
  const [valuation, setValuation] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof ValuationFormData, value: any) => {
    setErrors(prev => ({ ...prev, [field]: '' }));
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
      // Validate required fields
      const newErrors: Record<string, string> = {};
      if (!formData.revenue) newErrors.revenue = 'Revenue is required';
      if (!formData.growthRate) newErrors.growthRate = 'Growth rate is required';
      if (!formData.margins) newErrors.margins = 'Operating margins are required';
      if (!formData.sector) newErrors.sector = 'Sector is required';
      if (!formData.stage) newErrors.stage = 'Business stage is required';

      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return;

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

    // Debounce the calculation
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

  const FieldLabel = ({ children, tooltip }: { children: React.ReactNode, tooltip: string }) => (
    <div className="flex items-center gap-2 mb-2">
      <Label>{children}</Label>
      <TooltipProvider>
        <UITooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{tooltip}</p>
          </TooltipContent>
        </UITooltip>
      </TooltipProvider>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Valuation Calculator</CardTitle>
          <CardDescription>
            Adjust the parameters below to see how different factors affect your startup's valuation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Financial Metrics */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Financial Metrics</h3>
                <div>
                  <FieldLabel tooltip="Your company's annual revenue in the selected currency">
                    Annual Revenue
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      type="number"
                      value={formData.revenue}
                      onChange={(e) => handleInputChange('revenue', Number(e.target.value))}
                      className={`pl-8 ${errors.revenue ? 'border-destructive' : ''}`}
                      placeholder="Enter your annual revenue"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {currencies[formData.currency as keyof typeof currencies]?.symbol || '$'}
                    </span>
                  </div>
                  {errors.revenue && (
                    <p className="text-sm text-destructive mt-1">{errors.revenue}</p>
                  )}
                </div>

                <div>
                  <FieldLabel tooltip="The currency of your financial figures">
                    Currency
                  </FieldLabel>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleInputChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
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
                  <FieldLabel tooltip="Your annual revenue growth rate as a percentage">
                    Growth Rate (%)
                  </FieldLabel>
                  <Input
                    type="number"
                    value={formData.growthRate}
                    onChange={(e) => handleInputChange('growthRate', Number(e.target.value))}
                    className={errors.growthRate ? 'border-destructive' : ''}
                    placeholder="Enter growth rate"
                  />
                  {errors.growthRate && (
                    <p className="text-sm text-destructive mt-1">{errors.growthRate}</p>
                  )}
                </div>

                <div>
                  <FieldLabel tooltip="Your operating profit margin as a percentage">
                    Operating Margins (%)
                  </FieldLabel>
                  <Input
                    type="number"
                    value={formData.margins}
                    onChange={(e) => handleInputChange('margins', Number(e.target.value))}
                    className={errors.margins ? 'border-destructive' : ''}
                    placeholder="Enter operating margins"
                  />
                  {errors.margins && (
                    <p className="text-sm text-destructive mt-1">{errors.margins}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Business Information</h3>
                <div>
                  <FieldLabel tooltip="The primary sector your business operates in">
                    Sector
                  </FieldLabel>
                  <Select
                    value={formData.sector}
                    onValueChange={(value) => handleInputChange('sector', value)}
                  >
                    <SelectTrigger className={errors.sector ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select your sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(sectors).map(([key, { name }]) => (
                        <SelectItem key={key} value={key}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.sector && (
                    <p className="text-sm text-destructive mt-1">{errors.sector}</p>
                  )}
                </div>

                <div>
                  <FieldLabel tooltip="Your company's current stage of development">
                    Business Stage
                  </FieldLabel>
                  <Select
                    value={formData.stage}
                    onValueChange={(value) => handleInputChange('stage', value)}
                  >
                    <SelectTrigger className={errors.stage ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select your stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(businessStages).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.stage && (
                    <p className="text-sm text-destructive mt-1">{errors.stage}</p>
                  )}
                </div>
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
                <CardDescription>
                  See how different factors contribute to your startup's overall valuation
                </CardDescription>
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