import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info, FileText, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/validations";
import { sectors, businessStages, regions, valuationPurposes } from "@/lib/validations";
import type { ValuationFormData } from "@/lib/validations";
import { motion } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link } from "wouter";
import { ValuationReport } from "@/components/ValuationReport";
import { ValuationDashboard } from "@/components/dashboards/ValuationDashboard";

interface ReviewStepProps {
  data: Partial<ValuationFormData>;
  onUpdate: (data: Partial<ValuationFormData>) => void;
  onSubmit: (data: ValuationFormData) => void;
  onBack: () => void;
}

export function ReviewStep({ data, onUpdate, onSubmit, onBack }: ReviewStepProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [valuationData, setValuationData] = useState<any>(null);
  const isFundraising = data.valuationPurpose === 'fundraising';

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

      // First, trigger the valuation calculation and AI insights generation
      const valuationResponse = await fetch('/api/valuation/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!valuationResponse.ok) {
        throw new Error(`Valuation failed: ${await valuationResponse.text()}`);
      }

      const valuationResult = await valuationResponse.json();

      // Generate AI insights
      const insightsResponse = await fetch('/api/valuation/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, ...valuationResult }),
      });

      if (!insightsResponse.ok) {
        throw new Error(`Insights generation failed: ${await insightsResponse.text()}`);
      }

      const insightsData = await insightsResponse.json();

      // Combine all data
      const completeData = {
        ...data,
        ...valuationResult,
        ...insightsData,
      };

      // Store valuation data for the dashboard
      setValuationData(completeData);

      // Update the form data with the complete information
      onUpdate(completeData);

      // Show the report
      setShowReport(true);

      toast({
        title: "Success",
        description: "Your valuation report has been generated successfully.",
      });

      // Finally call onSubmit with the complete data
      onSubmit(completeData as ValuationFormData);
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

  if (showReport && isValidData(data) && valuationData) {
    return (
      <div className="space-y-8">
        <ValuationDashboard 
          valuation={valuationData.valuation}
          currency={data.currency}
          marketSentiment={valuationData.marketSentiment}
          industry={selectedIndustry || ""}
          region={selectedRegion?.name || ""}
        />
        <ValuationReport data={valuationData} />
      </div>
    );
  }

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

        {isFundraising && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20"
          >
            <div className="flex items-start gap-4">
              <TrendingUp className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="text-lg font-medium mb-2">Enhance Your Fundraising Package</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  For fundraising purposes, we recommend creating detailed financial projections and 
                  a fund utilization plan. This will strengthen your pitch to potential investors.
                </p>
                <Link href="/projections">
                  <Button
                    variant="outline"
                    className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Create Financial Projections
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

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