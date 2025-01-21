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
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Building2, Trophy, Globe2, Scale, Shield, ArrowRight } from "lucide-react";
import { sectors, industries, businessStages, regions, valuationPurposes } from "@/lib/validations";
import type { ValuationFormData } from "@/lib/validations";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface BusinessInfoStepProps {
  data: Partial<ValuationFormData>;
  onUpdate: (data: Partial<ValuationFormData>) => void;
  onNext: () => void;
  currentStep: number;
  totalSteps: number;
}

export function BusinessInfoStep({ data, onUpdate, onNext, currentStep, totalSteps }: BusinessInfoStepProps) {
  const [selectedSector, setSelectedSector] = useState<string>(data.sector || "");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ValuationFormData>({
    defaultValues: {
      businessName: data.businessName || "",
      sector: data.sector || "",
      industry: data.industry || "",
      stage: data.stage || "ideation_validated",
      intellectualProperty: data.intellectualProperty || "none",
      teamExperience: data.teamExperience || 0,
      customerBase: data.customerBase || 0,
      competitiveDifferentiation: data.competitiveDifferentiation || "medium",
      regulatoryCompliance: data.regulatoryCompliance || "notRequired",
      scalability: data.scalability || "moderate",
      valuationPurpose: data.valuationPurpose || "",
      region: data.region || "",
      revenue: data.revenue || 0,
      currency: data.currency || "USD",
      growthRate: data.growthRate || 0,
      margins: data.margins || 0
    },
  });

  const validateRequiredFields = (values: ValuationFormData): { isValid: boolean; missingFields: string[] } => {
    const requiredFields = [
      { field: 'businessName', label: 'Business Name' },
      { field: 'sector', label: 'Business Sector' },
      { field: 'industry', label: 'Industry' },
      { field: 'stage', label: 'Business Stage' },
      { field: 'intellectualProperty', label: 'IP Protection Status' },
      { field: 'competitiveDifferentiation', label: 'Competitive Differentiation' },
      { field: 'scalability', label: 'Business Scalability' },
      { field: 'valuationPurpose', label: 'Purpose of Valuation' },
      { field: 'region', label: 'Primary Region' }
    ];

    const missingFields = requiredFields.filter(({ field }) => {
      const value = values[field as keyof ValuationFormData];
      return !value || (typeof value === 'string' && !value.trim());
    });

    return {
      isValid: missingFields.length === 0,
      missingFields: missingFields.map(f => f.label)
    };
  };

  const handleSubmit = async (values: ValuationFormData) => {
    try {
      const validation = validateRequiredFields(values);

      if (!validation.isValid) {
        toast({
          title: "Required Fields Missing",
          description: `Please fill in the following fields: ${validation.missingFields.join(", ")}`,
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
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Core Business Information
              </CardTitle>
              <CardDescription>
                Let's start with your company's essential details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., TechStart Solutions"
                        className={cn(focusedField === "businessName" && "ring-2 ring-primary")}
                        onFocus={() => setFocusedField("businessName")}
                        onBlur={() => setFocusedField(null)}
                      />
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
                            <SelectItem key={key} value={key}>
                              {name}
                            </SelectItem>
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
                        onValueChange={(value) => {
                          form.setValue("industry", value);
                        }}
                        disabled={!selectedSector}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={selectedSector ? "Select your industry" : "Select sector first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedSector && sectors[selectedSector as keyof typeof sectors] &&
                            Object.entries(sectors[selectedSector as keyof typeof sectors].subsectors).map(([key, name]) => (
                              <SelectItem key={key} value={key}>
                                {name}
                              </SelectItem>
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
                      onValueChange={(value) => {
                        form.setValue("stage", value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(businessStages).map(([key, name]) => (
                          <SelectItem key={key} value={key}>
                            {name}
                          </SelectItem>
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
                        onValueChange={(value) => {
                          form.setValue("intellectualProperty", value);
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
                        onValueChange={(value) => {
                          form.setValue("competitiveDifferentiation", value);
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
                      onValueChange={(value) => {
                        form.setValue("scalability", value);
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
                      <FormControl>
                        <div className="relative">
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              form.setValue("valuationPurpose", value);
                            }}
                          >
                            <SelectTrigger className="pl-8">
                              <SelectValue placeholder="Select purpose" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(valuationPurposes).map(([key, name]) => (
                                <SelectItem key={key} value={key}>
                                  {name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Trophy className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                        </div>
                      </FormControl>
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
                      <FormControl>
                        <div className="relative">
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              form.setValue("region", value);
                            }}
                          >
                            <SelectTrigger className="pl-8">
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(regions).map(([key, { name }]) => (
                                <SelectItem key={key} value={key}>
                                  {name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Globe2 className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                        </div>
                      </FormControl>
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
                      <FormDescription>
                        Average relevant industry experience
                      </FormDescription>
                      <div className="pt-2">
                        <Slider
                          value={[field.value || 0]}
                          onValueChange={([value]) => {
                            form.setValue("teamExperience", value);
                          }}
                          max={20}
                          step={1}
                          className="pt-2"
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
                      <FormDescription>
                        Number of active customers/users
                      </FormDescription>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          form.setValue("customerBase", value);
                        }}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                toast({
                  title: "Form Reset",
                  description: "All fields have been reset to their default values",
                });
              }}
            >
              Reset
            </Button>
            <Button type="submit" className="gap-2">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}