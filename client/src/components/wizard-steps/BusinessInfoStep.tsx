import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { sectors, businessStages, regions } from "@/lib/validations";
import type { ValuationFormData } from "@/lib/validations";
import { useForm } from "react-hook-form";

interface BusinessInfoStepProps {
  data: Partial<ValuationFormData>;
  onUpdate: (data: Partial<ValuationFormData>) => void;
  onNext: () => void;
}

export function BusinessInfoStep({ data, onUpdate, onNext }: BusinessInfoStepProps) {
  const [selectedSector, setSelectedSector] = useState<string>(data.sector || "");

  const form = useForm<Partial<ValuationFormData>>({
    defaultValues: {
      ...data,
      sector: data.sector || "",
      industry: data.industry || "",
      stage: data.stage || "",
      region: data.region || "",
      teamExperience: data.teamExperience || 0,
      customerBase: data.customerBase || 0,
      intellectualProperty: data.intellectualProperty || "none",
      competitiveDifferentiation: data.competitiveDifferentiation || "low",
      regulatoryCompliance: data.regulatoryCompliance || "notRequired",
      scalability: data.scalability || "limited",
    },
  });

  const handleSectorChange = (value: string) => {
    setSelectedSector(value);
    const firstIndustry = Object.keys(sectors[value as keyof typeof sectors].subsectors)[0];
    form.setValue("sector", value);
    form.setValue("industry", firstIndustry);
    onUpdate({
      sector: value as keyof typeof sectors,
      industry: firstIndustry,
    });
  };

  const handleIndustryChange = (value: string) => {
    form.setValue("industry", value);
    onUpdate({ industry: value });
  };

  const handleStageChange = (value: string) => {
    form.setValue("stage", value);
    onUpdate({ stage: value as keyof typeof businessStages });
  };

  const handleRegionChange = (value: string) => {
    const region = value as keyof typeof regions;
    form.setValue("region", region);
    // Set the default currency for the selected region
    form.setValue("currency", regions[region].defaultCurrency);
    onUpdate({ 
      region,
      currency: regions[region].defaultCurrency 
    });
  };

  const handleSubmit = (values: Partial<ValuationFormData>) => {
    onUpdate(values);
    onNext();
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Let's understand your business in detail. This helps us choose the most
          appropriate valuation method and industry benchmarks.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What sector is your business in?</FormLabel>
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
                  </FormItem>
                )}
              />

              {selectedSector && (
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Which industry segment best describes your business?</FormLabel>
                      <Select
                        value={field.value}
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
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What stage is your business at?</FormLabel>
                    <Select
                      value={field.value}
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
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Region of Operation</FormLabel>
                    <FormDescription>
                      This helps us apply region-specific valuation standards and benchmarks
                    </FormDescription>
                    <Select
                      value={field.value}
                      onValueChange={handleRegionChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary region" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(regions).map(([key, { name }]) => (
                          <SelectItem key={key} value={key}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="teamExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Experience Level (years)</FormLabel>
                    <FormDescription>
                      Average years of relevant industry experience among key team members
                    </FormDescription>
                    <Slider
                      value={[field.value || 0]}
                      onValueChange={([value]) => {
                        field.onChange(value);
                        onUpdate({ teamExperience: value });
                      }}
                      max={20}
                      step={1}
                      className="pt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {field.value} years
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerBase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Customer Base</FormLabel>
                    <FormDescription>
                      Number of active customers/users
                    </FormDescription>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        field.onChange(value);
                        onUpdate({ customerBase: value });
                      }}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="intellectualProperty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intellectual Property Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        onUpdate({ intellectualProperty: value as ValuationFormData['intellectualProperty'] });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select IP status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No IP Protection</SelectItem>
                        <SelectItem value="pending">Patents Pending</SelectItem>
                        <SelectItem value="registered">Registered Patents/IP</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="competitiveDifferentiation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Competitive Differentiation</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        onUpdate({ competitiveDifferentiation: value as ValuationFormData['competitiveDifferentiation'] });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select competitive position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Limited Differentiation</SelectItem>
                        <SelectItem value="medium">Moderate Advantage</SelectItem>
                        <SelectItem value="high">Strong Market Position</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="regulatoryCompliance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Regulatory Compliance Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        onUpdate({ regulatoryCompliance: value as ValuationFormData['regulatoryCompliance'] });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select compliance status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="notRequired">Not Required</SelectItem>
                        <SelectItem value="inProgress">In Progress</SelectItem>
                        <SelectItem value="compliant">Fully Compliant</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scalability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Scalability</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        onUpdate({ scalability: value as ValuationFormData['scalability'] });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select scalability potential" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="limited">Limited Scale Potential</SelectItem>
                        <SelectItem value="moderate">Moderate Scalability</SelectItem>
                        <SelectItem value="high">Highly Scalable</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-6"
          >
            Continue
          </Button>
        </form>
      </Form>
    </div>
  );
}