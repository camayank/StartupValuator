import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/validations";
import { sectors, businessStages, regions, valuationPurposes } from "@/lib/validations";
import type { ValuationFormData } from "@/lib/validations";
import { motion } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ReviewStepProps {
  data: Partial<ValuationFormData>;
  onUpdate: (data: Partial<ValuationFormData>) => void;
  onSubmit: (data: ValuationFormData) => void;
  onBack: () => void;
}

export function ReviewStep({ data, onUpdate, onSubmit, onBack }: ReviewStepProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  // Strict validation logic for all required fields
  const isValidData = (data: Partial<ValuationFormData>): data is ValuationFormData => {
    const requiredFields = {
      businessName: typeof data.businessName === 'string' && data.businessName.trim().length > 0,
      valuationPurpose: typeof data.valuationPurpose === 'string' && Object.keys(valuationPurposes).includes(data.valuationPurpose),
      revenue: typeof data.revenue === 'number' && data.revenue >= 0,
      currency: typeof data.currency === 'string' && data.currency.length > 0,
      growthRate: typeof data.growthRate === 'number' && data.growthRate >= -100 && data.growthRate <= 1000,
      margins: typeof data.margins === 'number' && data.margins >= -100 && data.margins <= 100,
      sector: typeof data.sector === 'string' && Object.keys(sectors).includes(data.sector),
      industry: typeof data.industry === 'string' && data.industry.length > 0,
      stage: typeof data.stage === 'string' && Object.keys(businessStages).includes(data.stage),
      region: typeof data.region === 'string' && Object.keys(regions).includes(data.region)
    };

    const valid = Object.entries(requiredFields).every(([key, value]) => value);

    if (!valid) {
      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      console.log('Missing or invalid fields:', missingFields);
      toast({
        title: "Missing Required Fields",
        description: `Please fill in all required fields: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
    }

    return valid;
  };

  const handleSubmit = async () => {
    if (!isValidData(data)) {
      return;
    }

    try {
      setIsGenerating(true);

      // First, trigger the valuation calculation
      const valuationResponse = await fetch('/api/valuation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!valuationResponse.ok) {
        throw new Error(`Valuation failed: ${await valuationResponse.text()}`);
      }

      const valuationData = await valuationResponse.json();

      // Then generate the report with the combined data
      const reportResponse = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, ...valuationData }),
      });

      if (!reportResponse.ok) {
        throw new Error(`Report generation failed: ${await reportResponse.text()}`);
      }

      // Get the PDF blob and trigger download
      const blob = await reportResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'startup-valuation-report.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Your valuation report has been generated and downloaded.",
      });

      // Finally call onSubmit with the complete data
      onSubmit({ ...data, ...valuationData });
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate report",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedSector = data.sector ? sectors[data.sector] : null;
  const selectedIndustry = selectedSector?.subsectors[data.industry as keyof typeof selectedSector['subsectors']];
  const selectedStage = data.stage ? businessStages[data.stage] : null;
  const selectedRegion = data.region ? regions[data.region] : null;

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
            className="px-8 font-medium flex items-center gap-2"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <FileText className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Generate Report
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}