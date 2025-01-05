import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, DollarSign, TrendingUp, PieChart } from "lucide-react";
import { currencies } from "@/lib/validations";
import type { ValuationFormData } from "@/lib/validations";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface FinancialDetailsStepProps {
  data: Partial<ValuationFormData>;
  onUpdate: (data: Partial<ValuationFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function FinancialDetailsStep({
  data,
  onUpdate,
  onNext,
  onBack,
}: FinancialDetailsStepProps) {
  const handleChange = (field: keyof ValuationFormData, value: any) => {
    onUpdate({ [field]: value });
  };

  const currencySymbol = data.currency ? currencies[data.currency as keyof typeof currencies].symbol : '$';

  // Validate required fields
  const isValid = Boolean(
    data.revenue !== undefined && data.revenue >= 0 &&
    data.growthRate !== undefined && 
    data.margins !== undefined
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Please provide basic financial information about your business.
          All monetary values will be in {data.currency || 'USD'}.
          Fields marked with * are required.
        </AlertDescription>
      </Alert>

      <motion.div
        className="grid md:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-6 bg-card rounded-lg border shadow-sm space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue *
          </h3>
          <div className="space-y-2">
            <label className="text-sm font-medium">Annual Revenue</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                {currencySymbol}
              </span>
              <Input
                type="number"
                value={data.revenue}
                onChange={(e) => handleChange('revenue', Number(e.target.value))}
                placeholder={`e.g., ${currencySymbol}1,000,000`}
                className="pl-7 transition-all duration-200 hover:border-primary focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Enter your total annual revenue
            </p>
          </div>
        </div>

        <div className="p-6 bg-card rounded-lg border shadow-sm space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Growth *
          </h3>
          <div className="space-y-2">
            <label className="text-sm font-medium">Growth Rate (%)</label>
            <div className="relative">
              <TrendingUp className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="number"
                value={data.growthRate}
                onChange={(e) => handleChange('growthRate', Number(e.target.value))}
                placeholder="e.g., 25"
                className="pl-9 transition-all duration-200 hover:border-primary focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Expected annual growth rate
            </p>
          </div>
        </div>

        <div className="p-6 bg-card rounded-lg border shadow-sm space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Margins *
          </h3>
          <div className="space-y-2">
            <label className="text-sm font-medium">Operating Margins (%)</label>
            <div className="relative">
              <PieChart className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="number"
                value={data.margins}
                onChange={(e) => handleChange('margins', Number(e.target.value))}
                placeholder="e.g., 15"
                className="pl-9 transition-all duration-200 hover:border-primary focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Current operating profit margin
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="flex justify-end space-x-4 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={onNext}
          disabled={!isValid}
        >
          Next
        </Button>
      </motion.div>
    </motion.div>
  );
}