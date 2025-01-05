import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/validations";
import { sectors, businessStages, regions, valuationPurposes } from "@/lib/validations";
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
    const requiredFields = [
      'businessName',
      'valuationPurpose',
      'revenue',
      'currency',
      'growthRate',
      'margins',
      'sector',
      'industry',
      'stage',
      'region'
    ];

    return requiredFields.every(field => {
      const value = data[field as keyof ValuationFormData];
      // Check if the value exists and is not empty
      return value !== undefined && value !== null && value !== '';
    });
  };

  const selectedSector = data.sector ? sectors[data.sector] : null;
  const selectedIndustry = selectedSector?.subsectors[data.industry as keyof typeof selectedSector['subsectors']];
  const selectedStage = data.stage ? businessStages[data.stage] : null;
  const selectedRegion = data.region ? regions[data.region] : null;

  const canGenerate = isValidData(data);

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Please review your information before we generate your valuation report.
          All fields marked with * are required.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Business Name *</p>
            <p className="font-medium">{data.businessName || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Valuation Purpose *</p>
            <p className="font-medium">
              {data.valuationPurpose ? valuationPurposes[data.valuationPurpose] : "Not provided"}
            </p>
          </div>
        </div>

        <h3 className="text-lg font-medium mt-6">Business Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Sector *</p>
            <p className="font-medium">{selectedSector?.name || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Industry *</p>
            <p className="font-medium">{selectedIndustry || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Business Stage *</p>
            <p className="font-medium">{selectedStage || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Region *</p>
            <p className="font-medium">{selectedRegion?.name || "Not provided"}</p>
          </div>
        </div>

        <h3 className="text-lg font-medium mt-6">Financial Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Revenue *</p>
            <p className="font-medium">
              {data.revenue !== undefined && data.currency
                ? formatCurrency(data.revenue, data.currency)
                : "Not provided"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Growth Rate *</p>
            <p className="font-medium">
              {data.growthRate !== undefined ? `${data.growthRate}%` : "Not provided"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Operating Margins *</p>
            <p className="font-medium">
              {data.margins !== undefined ? `${data.margins}%` : "Not provided"}
            </p>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canGenerate}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Generate Valuation Report
          </Button>
        </div>
      </div>
    </div>
  );
}