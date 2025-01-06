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
import { Check, Info, Sun, Moon } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { NumericInput } from "@/components/ui/numeric-input";

// High contrast color palette that meets WCAG 2.1 AA standards
const HIGH_CONTRAST_COLORS = ["#0052CC", "#00875A", "#DE350B", "#403294"];
const STANDARD_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

// Help content for each field
const fieldHelp = {
  revenue: {
    title: "Annual Revenue",
    description: "Your company's total annual revenue in the selected currency.",
    tips: [
      "Include all sources of revenue from your core business",
      "Use the last 12 months of data if available",
      "For early-stage startups, use projected annual revenue",
    ],
    example: "Example: If you make $100,000 per month, enter $1,200,000",
  },
  growthRate: {
    title: "Growth Rate",
    description: "Your company's year-over-year revenue growth rate as a percentage.",
    tips: [
      "Calculate: ((Current Revenue - Previous Revenue) / Previous Revenue) × 100",
      "Use historical data if available",
      "For early-stage startups, use projected growth rate",
    ],
    example: "Example: If revenue doubled, enter 100%",
  },
  margins: {
    title: "Operating Margins",
    description: "Your operating profit margin as a percentage of revenue.",
    tips: [
      "Calculate: (Operating Income / Revenue) × 100",
      "Operating Income = Revenue - Operating Expenses",
      "Include all direct costs and overhead",
    ],
    example: "Example: If you make $200K profit on $1M revenue, enter 20%",
  },
  sector: {
    title: "Business Sector",
    description: "The primary industry sector your business operates in.",
    tips: [
      "Choose the sector that best matches your core business",
      "Consider where most of your revenue comes from",
      "This affects industry-specific valuation multiples",
    ],
  },
  stage: {
    title: "Business Stage",
    description: "Your company's current stage of development.",
    tips: [
      "Consider factors like revenue, market presence, and growth",
      "This impacts the valuation methodology used",
      "Be realistic about your current stage",
    ],
  },
};

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
  const [highContrast, setHighContrast] = useState(() => {
    const stored = localStorage.getItem('highContrast');
    return stored ? JSON.parse(stored) : false;
  });

  const colors = highContrast ? HIGH_CONTRAST_COLORS : STANDARD_COLORS;

  // Toggle high contrast mode
  const toggleContrast = () => {
    setHighContrast(prev => {
      const newValue = !prev;
      localStorage.setItem('highContrast', JSON.stringify(newValue));
      return newValue;
    });
  };

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

  const FieldLabel = ({ field, children }: { field: keyof typeof fieldHelp, children: React.ReactNode }) => {
    const help = fieldHelp[field];
    return (
      <div className="flex items-center gap-2 mb-2">
        <Label>{children}</Label>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
              <Info className="h-4 w-4 text-muted-foreground" />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium">{help.title}</h4>
              <p className="text-sm text-muted-foreground">{help.description}</p>
              {help.tips && (
                <div className="mt-2">
                  <h5 className="text-sm font-medium mb-1">Tips:</h5>
                  <ul className="text-sm space-y-1">
                    {help.tips.map((tip, i) => (
                      <li key={i} className="text-muted-foreground">• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
              {help.example && (
                <p className="text-sm italic text-muted-foreground mt-2">{help.example}</p>
              )}
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Interactive Valuation Calculator</CardTitle>
              <CardDescription>
                Adjust the parameters below to see how different factors affect your startup's valuation.
                Hover over the info icons for detailed explanations and tips.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleContrast}
              aria-label={highContrast ? "Disable high contrast mode" : "Enable high contrast mode"}
              className="ml-4"
            >
              {highContrast ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Financial Metrics */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Financial Metrics</h3>
                  <div>
                    <FieldLabel field="revenue">Annual Revenue</FieldLabel>
                    <NumericInput
                      value={formData.revenue}
                      onValueChange={(value) => handleInputChange('revenue', value)}
                      className={errors.revenue ? 'border-destructive' : ''}
                      placeholder="Enter your annual revenue"
                      prefix={currencies[formData.currency as keyof typeof currencies]?.symbol || '$'}
                      thousandSeparator=","
                      decimalScale={0}
                    />
                    {errors.revenue && (
                      <p className="text-sm text-destructive mt-1">{errors.revenue}</p>
                    )}
                  </div>

                  <div>
                    <Label className="mb-2">Currency</Label>
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
                    <FieldLabel field="growthRate">Growth Rate (%)</FieldLabel>
                    <NumericInput
                      value={formData.growthRate}
                      onValueChange={(value) => handleInputChange('growthRate', value)}
                      className={errors.growthRate ? 'border-destructive' : ''}
                      placeholder="Enter growth rate"
                      suffix="%"
                      decimalScale={1}
                      allowNegative
                    />
                    {errors.growthRate && (
                      <p className="text-sm text-destructive mt-1">{errors.growthRate}</p>
                    )}
                  </div>

                  <div>
                    <FieldLabel field="margins">Operating Margins (%)</FieldLabel>
                    <NumericInput
                      value={formData.margins}
                      onValueChange={(value) => handleInputChange('margins', value)}
                      className={errors.margins ? 'border-destructive' : ''}
                      placeholder="Enter operating margins"
                      suffix="%"
                      decimalScale={1}
                      allowNegative
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
                    <FieldLabel field="sector">Sector</FieldLabel>
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
                    <FieldLabel field="stage">Business Stage</FieldLabel>
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
      </div>

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
                  {/* Bar Chart with improved accessibility */}
                  <div className="h-[400px]" role="figure" aria-label="Valuation breakdown bar chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={breakdownData} layout="vertical">
                        <XAxis
                          type="number"
                          tickFormatter={formatCurrency}
                          stroke={highContrast ? "#000000" : undefined}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={150}
                          stroke={highContrast ? "#000000" : undefined}
                        />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            color: highContrast ? "#000000" : undefined,
                          }}
                        />
                        <Bar
                          dataKey="value"
                          fill={colors[0]}
                          opacity={0.8}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Pie Chart with improved accessibility */}
                  <div className="h-[400px]" role="figure" aria-label="Valuation breakdown pie chart">
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
                          label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                        >
                          {breakdownData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={colors[index % colors.length]}
                              stroke={highContrast ? "#000000" : undefined}
                              strokeWidth={highContrast ? 2 : 1}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            color: highContrast ? "#000000" : undefined,
                          }}
                        />
                        <Legend
                          formatter={(value) => <span style={{ color: highContrast ? "#000000" : undefined }}>{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* CTA section with improved contrast */}
                <div className="mt-8 p-4 bg-primary/5 rounded-lg border-2 border-primary/10">
                  <h3 className="text-lg font-semibold mb-2">
                    Want More Detailed Analysis?
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Sign up for full access to:
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    {["Comprehensive valuation reports", "Industry-specific metrics",
                      "Growth potential analysis", "Expert valuation guidance"].map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span className={highContrast ? "text-black" : undefined}>{feature}</span>
                        </li>
                      ))}
                  </ul>
                  <Button className="w-full md:w-auto">
                    Get Full Access
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}