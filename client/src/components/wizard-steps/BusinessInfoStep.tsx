import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { sectors, businessStages } from "@/lib/validations";
import type { ValuationFormData } from "@/lib/validations";

interface BusinessInfoStepProps {
  data: Partial<ValuationFormData>;
  onUpdate: (data: Partial<ValuationFormData>) => void;
  onNext: () => void;
}

export function BusinessInfoStep({ data, onUpdate, onNext }: BusinessInfoStepProps) {
  const [selectedSector, setSelectedSector] = useState<string>(data.sector || "");
  
  const handleSectorChange = (value: string) => {
    setSelectedSector(value);
    // Auto-select first industry in the sector
    const firstIndustry = Object.keys(sectors[value as keyof typeof sectors].subsectors)[0];
    onUpdate({
      sector: value as keyof typeof sectors,
      industry: firstIndustry,
    });
  };

  const handleIndustryChange = (value: string) => {
    onUpdate({ industry: value });
  };

  const handleStageChange = (value: string) => {
    onUpdate({ stage: value as keyof typeof businessStages });
  };

  const isValid = data.sector && data.industry && data.stage;

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Let's start by understanding your business. This helps us choose the most
          appropriate valuation method and industry benchmarks.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">What sector is your business in?</label>
          <Select
            value={selectedSector}
            onValueChange={handleSectorChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your business sector" />
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

        {selectedSector && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Which industry segment best describes your business?
            </label>
            <Select
              value={data.industry}
              onValueChange={handleIndustryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(sectors[selectedSector as keyof typeof sectors].subsectors)
                  .map(([key, name]) => (
                    <SelectItem key={key} value={key}>
                      {name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">
            What stage is your business at?
          </label>
          <Select
            value={data.stage}
            onValueChange={handleStageChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your business stage" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(businessStages).map(([key, name]) => (
                <SelectItem key={key} value={key}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={onNext}
        disabled={!isValid}
        className="w-full mt-6"
      >
        Continue
      </Button>
    </div>
  );
}
