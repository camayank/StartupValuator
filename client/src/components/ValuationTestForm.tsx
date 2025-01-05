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
import { industries, currencies, businessStages } from "@/lib/validations";
import type { ValuationFormData } from "@/lib/validations";

interface ValuationTestFormProps {
  onSubmit: (data: ValuationFormData) => void;
}

const defaultValues: ValuationFormData = {
  revenue: 1000000,
  currency: "USD",
  growthRate: 35,
  margins: 25,
  industry: "software_system",
  stage: "revenue_growing",
  intellectualProperty: "registered",
  teamExperience: 8,
  customerBase: 1000,
  competitiveDifferentiation: "high",
  regulatoryCompliance: "compliant",
  scalability: "high",
  assetValue: 500000,
};

export function ValuationTestForm({ onSubmit }: ValuationTestFormProps) {
  const [formData, setFormData] = useState<ValuationFormData>(defaultValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof ValuationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
              <label className="text-sm font-medium">Industry</label>
              <Select
                value={formData.industry}
                onValueChange={(value) => handleChange('industry', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(industries).map(([key, name]) => (
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
