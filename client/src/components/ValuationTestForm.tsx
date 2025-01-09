import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sectors, currencies, businessStages, regions } from "@/lib/validations";
import type { ValuationFormData } from "@/lib/validations";
import { useToast } from "@/hooks/use-toast";

interface ValuationTestFormProps {
  onSubmit: (data: ValuationFormData) => void;
}

// Default values that match exactly with our validation schema
const defaultValues: ValuationFormData = {
  businessName: "Test Business",
  valuationPurpose: "internal",
  revenue: 1000000,
  currency: "USD",
  growthRate: 35,
  margins: 25,
  sector: "technology",
  industry: "software_system",
  stage: "revenue_growing",
  region: "us",
  intellectualProperty: "registered",
  teamExperience: 8,
  customerBase: 1000,
  competitiveDifferentiation: "high",
  regulatoryCompliance: "compliant",
  scalability: "high"
};

export function ValuationTestForm({ onSubmit }: ValuationTestFormProps) {
  const [formData, setFormData] = useState<ValuationFormData>(defaultValues);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ensure sector and industry values are valid before submission
      if (!(formData.sector in sectors)) {
        throw new Error("Invalid sector selected");
      }
      if (!(formData.industry in sectors[formData.sector as keyof typeof sectors].subsectors)) {
        throw new Error("Invalid industry selected for the chosen sector");
      }
      onSubmit(formData);
    } catch (error) {
      toast({
        title: "Validation Error",
        description: error instanceof Error ? error.message : "Failed to submit form",
        variant: "destructive",
      });
    }
  };

  const handleChange = (field: keyof ValuationFormData, value: any) => {
    setFormData(prev => {
      // If changing sector, reset industry to the first option in that sector
      if (field === 'sector') {
        const firstIndustry = Object.keys(sectors[value as keyof typeof sectors].subsectors)[0];
        return { ...prev, [field]: value, industry: firstIndustry };
      }
      return { ...prev, [field]: value };
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Quick Test Valuation Form</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Name</label>
              <Input
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Revenue</label>
              <Input
                type="number"
                value={formData.revenue}
                onChange={(e) => handleChange('revenue', Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Currency</label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(currencies).map(([key, { name }]) => (
                    <SelectItem key={key} value={key}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Growth Rate (%)</label>
              <Input
                type="number"
                value={formData.growthRate}
                onChange={(e) => handleChange('growthRate', Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Operating Margins (%)</label>
              <Input
                type="number"
                value={formData.margins}
                onChange={(e) => handleChange('margins', Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Region</label>
              <Select
                value={formData.region}
                onValueChange={(value) => handleChange('region', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(regions).map(([key, { name }]) => (
                    <SelectItem key={key} value={key}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sector</label>
              <Select
                value={formData.sector}
                onValueChange={(value) => handleChange('sector', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sector" />
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Industry</label>
              <Select
                value={formData.industry}
                onValueChange={(value) => handleChange('industry', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(sectors[formData.sector as keyof typeof sectors].subsectors).map(([key, name]) => (
                    <SelectItem key={key} value={key}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Business Stage</label>
              <Select
                value={formData.stage}
                onValueChange={(value) => handleChange('stage', value)}
              >
                <SelectTrigger>
                  <SelectValue />
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

          <Button type="submit" className="w-full">
            Calculate Valuation
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}