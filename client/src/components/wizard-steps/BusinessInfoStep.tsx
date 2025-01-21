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
import { Info, Building2, Trophy, Globe2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import type { ValuationFormData } from "@/lib/validations";
import { sectors, businessStages, regions, valuationPurposes } from "@/lib/validations";

interface BusinessInfoStepProps {
  data: Partial<ValuationFormData>;
  onUpdate: (data: Partial<ValuationFormData>) => void;
  onNext: () => void;
}

export function BusinessInfoStep({ data, onUpdate, onNext }: BusinessInfoStepProps) {
  const [selectedSector, setSelectedSector] = useState<string>(data.sector || "");
  const { toast } = useToast();

  const form = useForm<ValuationFormData>({
    defaultValues: {
      businessName: data.businessName || "",
      sector: data.sector || "",
      industry: data.industry || "",
      stage: data.stage || "",
      intellectualProperty: data.intellectualProperty || "none",
      teamExperience: data.teamExperience || 0,
      customerBase: data.customerBase || 0,
      competitiveDifferentiation: data.competitiveDifferentiation || "medium",
      regulatoryCompliance: data.regulatoryCompliance || "notRequired",
      scalability: data.scalability || "moderate",
      valuationPurpose: data.valuationPurpose || "",
      region: data.region || "",
      revenue: data.revenue || 0,
      growthRate: data.growthRate || 0,
      margins: data.margins || 0
    }
  });

  const validateRequiredFields = (values: ValuationFormData) => {
    const requiredFields = [
      { field: "businessName", label: "Business Name" },
      { field: "sector", label: "Business Sector" },
      { field: "industry", label: "Industry" },
      { field: "stage", label: "Business Stage" },
      { field: "intellectualProperty", label: "IP Protection Status" },
      { field: "competitiveDifferentiation", label: "Competitive Differentiation" },
      { field: "scalability", label: "Business Scalability" },
      { field: "valuationPurpose", label: "Purpose of Valuation" },
      { field: "region", label: "Primary Region" }
    ];

    const missingFields = requiredFields.filter(({ field }) => {
      const value = values[field as keyof ValuationFormData];
      return !value || (typeof value === "string" && value.trim() === "");
    });

    return {
      isValid: missingFields.length === 0,
      missingFields: missingFields.map(f => f.label)
    };
  };

  const handleSubmit = async (values: ValuationFormData) => {
    const validation = validateRequiredFields(values);

    if (!validation.isValid) {
      toast({
        title: "Required Fields Missing",
        description: `Please fill in: ${validation.missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    try {
      await onUpdate(values);
      onNext();
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Error",
        description: "Failed to save business information. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSectorChange = (value: string) => {
    setSelectedSector(value);
    form.setValue("sector", value);
    form.setValue("industry", ""); // Reset industry when sector changes
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-primary/5 border-primary/10">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-primary/90">
          Fill in your business information below. All fields marked with * are required.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid gap-6">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., TechStart Solutions" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Sector *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={handleSectorChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your sector" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(sectors).map(([key, { name }]) => (
                          <SelectItem key={key} value={key}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => form.setValue("industry", value)}
                      disabled={!selectedSector}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={selectedSector ? "Select your industry" : "Select sector first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedSector && sectors[selectedSector]?.subsectors &&
                          Object.entries(sectors[selectedSector].subsectors).map(([key, name]) => (
                            <SelectItem key={key} value={key}>{name}</SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Stage *</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => form.setValue("stage", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(businessStages).map(([key, name]) => (
                        <SelectItem key={key} value={key}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="valuationPurpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose of Valuation *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => form.setValue("valuationPurpose", value)}
                    >
                      <SelectTrigger className="pl-8">
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(valuationPurposes).map(([key, name]) => (
                          <SelectItem key={key} value={key}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Trophy className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Region *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => form.setValue("region", value)}
                    >
                      <SelectTrigger className="pl-8">
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(regions).map(([key, { name }]) => (
                          <SelectItem key={key} value={key}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Globe2 className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="submit">Continue</Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}