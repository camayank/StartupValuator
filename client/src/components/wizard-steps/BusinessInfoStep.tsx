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

  const handleSectorChange = (value: string) => {
    setSelectedSector(value);
    form.setValue("sector", value);
    form.setValue("industry", ""); // Reset industry when sector changes
  };

  const handleSubmit = async (values: ValuationFormData) => {
    try {
      // Only check the core required fields
      const coreRequiredFields = [
        'businessName',
        'sector',
        'industry',
        'stage'
      ];

      const missingFields = coreRequiredFields.filter(field => {
        const value = values[field as keyof ValuationFormData];
        return !value || (typeof value === 'string' && value.trim() === '');
      });

      if (missingFields.length > 0) {
        toast({
          title: "Required Fields Missing",
          description: "Please fill in the core business information fields marked with *",
          variant: "destructive",
        });
        return;
      }

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

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
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
                name="intellectualProperty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IP Protection Status *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => form.setValue("intellectualProperty", value)}
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="competitiveDifferentiation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Competitive Differentiation *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => form.setValue("competitiveDifferentiation", value)}
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="scalability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Scalability *</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => form.setValue("scalability", value)}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="teamExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Experience (years)</FormLabel>
                    <FormDescription>Average relevant industry experience</FormDescription>
                    <div className="pt-2">
                      <Slider
                        value={[field.value || 0]}
                        onValueChange={([value]) => form.setValue("teamExperience", value)}
                        max={20}
                        step={1}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        {field.value} years
                      </p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerBase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Customer Base</FormLabel>
                    <FormDescription>Number of active customers/users</FormDescription>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => form.setValue("customerBase", Number(e.target.value))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" type="button" onClick={() => form.reset()}>
                Reset
              </Button>
              <Button type="submit">Continue</Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}