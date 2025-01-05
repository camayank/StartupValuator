import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { formatCurrency } from "@/lib/validations";
import { sectors, businessStages } from "@/lib/validations";
import type { ValuationFormData } from "@/lib/validations";

interface ReviewStepProps {
  data: Partial<ValuationFormData>;
  onUpdate: (data: Partial<ValuationFormData>) => void;
  onSubmit: (data: ValuationFormData) => void;
  onBack: () => void;
}

export function ReviewStep({ data, onUpdate, onSubmit, onBack }: ReviewStepProps) {
  const handleSubmit = () => {
    if (isValidData(data)) {
      onSubmit(data as ValuationFormData);
    }
  };

  const isValidData = (data: Partial<ValuationFormData>): data is ValuationFormData => {
    return !!(
      data.revenue !== undefined &&
      data.currency &&
      data.growthRate !== undefined &&
      data.margins !== undefined &&
      data.sector &&
      data.industry &&
      data.stage
    );
  };

  const selectedSector = sectors[data.sector as keyof typeof sectors];
  const selectedIndustry = selectedSector?.subsectors[data.industry as keyof typeof selectedSector['subsectors']];
  const selectedStage = businessStages[data.stage as keyof typeof businessStages];

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Please review your information before we generate your valuation report.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Business Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Sector</p>
            <p className="font-medium">{selectedSector?.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Industry</p>
            <p className="font-medium">{selectedIndustry}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Business Stage</p>
            <p className="font-medium">{selectedStage}</p>
          </div>
        </div>

        <h3 className="text-lg font-medium mt-6">Financial Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Revenue</p>
            <p className="font-medium">
              {data.revenue !== undefined
                ? formatCurrency(data.revenue, data.currency)
                : "Not provided"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Growth Rate</p>
            <p className="font-medium">
              {data.growthRate !== undefined ? `${data.growthRate}%` : "Not provided"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Operating Margins</p>
            <p className="font-medium">
              {data.margins !== undefined ? `${data.margins}%` : "Not provided"}
            </p>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!isValidData(data)}
          className="w-full mt-6"
        >
          Generate Valuation Report
        </Button>
      </div>
    </div>
  );
}
