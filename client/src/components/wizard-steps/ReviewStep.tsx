import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/validations";
import { sectors, businessStages, regions, valuationPurposes } from "@/lib/validations";
import type { ValuationFormData } from "@/lib/validations";
import { motion } from 'framer-motion';

interface ReviewStepProps {
  data: Partial<ValuationFormData>;
  onUpdate: (data: Partial<ValuationFormData>) => void;
  onSubmit: (data: ValuationFormData) => void;
  onBack: () => void;
}

export function ReviewStep({ data, onUpdate, onSubmit, onBack }: ReviewStepProps) {
  const handleSubmit = () => {
    const valid = isValidData(data);
    console.log("Submit attempted. Data valid:", valid, "Current data:", data);
    if (valid) {
      onSubmit(data as ValuationFormData);
    }
  };

  const isValidData = (data: Partial<ValuationFormData>): data is ValuationFormData => {
    const validations = {
      businessName: Boolean(data.businessName?.trim()),
      valuationPurpose: Boolean(data.valuationPurpose),
      revenue: data.revenue !== undefined && data.revenue >= 0,
      currency: Boolean(data.currency),
      growthRate: data.growthRate !== undefined && data.growthRate >=0, //Added check for >=0
      margins: data.margins !== undefined && data.margins >=0, //Added check for >=0
      sector: Boolean(data.sector),
      industry: Boolean(data.industry),
      stage: Boolean(data.stage),
      region: Boolean(data.region)
    };

    console.log("Field validations:", validations);

    return Object.values(validations).every(Boolean);
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

        <motion.div
          className="flex justify-between items-center mt-8 pt-4 border-t"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="outline"
            onClick={onBack}
            className="px-6"
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canGenerate}
            className="px-8 font-medium flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Generate Report
          </Button>
        </motion.div>
      </div>
    </div>
  );
}