import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { currencies } from "@/lib/validations";
import type { ValuationFormData } from "@/lib/validations";

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

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Please provide basic financial information about your business.
          All monetary values will be in {data.currency || 'USD'}.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Revenue</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {currencySymbol}
            </span>
            <Input
              type="number"
              value={data.revenue}
              onChange={(e) => handleChange('revenue', Number(e.target.value))}
              placeholder="Enter your current revenue"
              className="pl-7"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Growth Rate (%)</label>
          <Input
            type="number"
            value={data.growthRate}
            onChange={(e) => handleChange('growthRate', Number(e.target.value))}
            placeholder="Expected annual growth rate"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Operating Margins (%)</label>
          <Input
            type="number"
            value={data.margins}
            onChange={(e) => handleChange('margins', Number(e.target.value))}
            placeholder="Current operating margins"
          />
        </div>
      </div>
    </div>
  );
}