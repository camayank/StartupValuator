import { useState, useEffect } from "react";
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
import { Info, Building2, Trophy, Globe2, Scale, Shield, ArrowRight } from "lucide-react";
import { sectors, industries, businessStages, regions, valuationPurposes, valuationFormSchema } from "@/lib/validations";
import type { ValuationFormData } from "@/lib/validations";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
    resolver: zodResolver(valuationFormSchema),
    defaultValues: {
      businessName: data.businessName || "",
      valuationPurpose: data.valuationPurpose || "fundraising",
      sector: data.sector as ValuationFormData["sector"],
      industry: data.industry as ValuationFormData["industry"],
      stage: data.stage as ValuationFormData["stage"],
      region: data.region || "us",
      complianceStandard: data.complianceStandard || undefined,
      teamExperience: data.teamExperience || 0,
      customerBase: data.customerBase || 0,
      intellectualProperty: data.intellectualProperty || "none",
      competitiveDifferentiation: data.competitiveDifferentiation || "low",
      regulatoryCompliance: data.regulatoryCompliance || "notRequired",
      scalability: data.scalability || "limited",
      currency: "USD",
      revenue: 0,
      margins: 0,
      growthRate: 0
    },
  });

  useEffect(() => {
    if (selectedSector) {
      const sectorData = sectors[selectedSector as keyof typeof sectors];
      if (sectorData) {
        const firstIndustry = Object.keys(sectorData.subsectors)[0];
        const stage = getRecommendedStage(selectedSector);

        form.setValue("industry", firstIndustry);
        form.setValue("stage", stage);
        form.setValue("sector", selectedSector as ValuationFormData["sector"]);

        onUpdate({
          sector: selectedSector as keyof typeof sectors,
          industry: firstIndustry,
          stage
        });
      }
    }
  }, [selectedSector, form]);

  const getRecommendedStage = (sector: string): keyof typeof businessStages => {
    switch (sector) {
      case "technology":
      case "fintech":
        return "mvp_development";
      case "healthtech":
        return "beta_testing";
      case "enterprise":
        return "revenue_early";
      default:
        return "ideation_validated";
    }
  };

  const handleSubmit = async (values: ValuationFormData) => {
    try {
      const requiredFields = ['businessName', 'sector', 'industry', 'stage', 'valuationPurpose', 'region'] as const;
      const missingFields = requiredFields.filter(field => !values[field]);

      if (missingFields.length > 0) {
        const fieldNames = missingFields.map(field => field.replace(/([A-Z])/g, ' $1').toLowerCase());
        toast({
          title: "Required Fields Missing",
          description: `Please fill in: ${fieldNames.join(', ')}`,
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
  };

  const handleRegionChange = (value: string) => {
    const region = value as keyof typeof regions;
    form.setValue("region", region);
    form.setValue("complianceStandard", undefined);
    onUpdate({
      region,
      currency: regions[region].defaultCurrency,
      complianceStandard: undefined
    });
  };

  const handleStageChange = (value: string) => {
    form.setValue("stage", value as ValuationFormData["stage"]);
    onUpdate({ stage: value as ValuationFormData["stage"] });
  };

  const handleIndustryChange = (value: string) => {
    form.setValue("industry", value);
    onUpdate({ industry: value });
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-primary/5 border-primary/10">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-primary/90">
          Enter your core business information. We'll auto-suggest relevant options based on your inputs.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Start with your company's core details
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
                      <div className="relative">
                        <Input
                          placeholder="e.g., TechStart Solutions"
                          {...field}
                          className={cn(
                            "pl-8",
                            focusedField === "businessName" && "ring-2 ring-primary"
                          )}
                          onFocus={() => setFocusedField("businessName")}
                          onBlur={() => setFocusedField(null)}
                          required
                        />
                        <Building2 className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      </div>
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
                      <FormControl>
                        <div className="relative">
                          <Select
                            value={selectedSector}
                            onValueChange={handleSectorChange}
                          >
                            <SelectTrigger className="pl-8">
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
                          <Globe2 className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                              field.onChange(value);
                              onUpdate({ valuationPurpose: value as ValuationFormData['valuationPurpose'] });
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
                  name="stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Stage *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Select
                            value={field.value}
                            onValueChange={handleStageChange}
                          >
                            <SelectTrigger className="pl-8">
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
                          <Scale className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Indicate your company's current stage of development
                      </FormDescription>
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
                            onValueChange={handleRegionChange}
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
                <FormField
                  control={form.control}
                  name="intellectualProperty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IP Protection Status</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              onUpdate({ intellectualProperty: value as ValuationFormData['intellectualProperty'] });
                            }}
                          >
                            <SelectTrigger className="pl-8">
                              <SelectValue placeholder="Select IP status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No IP Protection</SelectItem>
                              <SelectItem value="pending">Patents Pending</SelectItem>
                              <SelectItem value="registered">Registered Patents/IP</SelectItem>
                            </SelectContent>
                          </Select>
                          <Shield className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Select
                          value={field.value}
                          onValueChange={handleIndustryChange}
                        >
                          <SelectTrigger className="pl-8">
                            <SelectValue placeholder="Select your industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(industries).map(([key, name]) => (
                              <SelectItem key={key} value={key}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Building2 className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="complianceStandard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compliance Standard</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            onUpdate({ complianceStandard: value });
                          }}
                        >
                          <SelectTrigger className="pl-8">
                            <SelectValue placeholder="Select compliance standard" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(regions[form.getValues("region") as keyof typeof regions] ? regions[form.getValues("region") as keyof typeof regions].complianceStandards : regions.other.complianceStandards).map(([key, name]) => (
                              <SelectItem key={key} value={key}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Shield className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        field.onChange(value);
                        onUpdate({ customerBase: value });
                      }}
                    />
                    <FormMessage />
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
                    <FormMessage />
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
                    <FormMessage />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" className="gap-2">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

const regionSpecificStandards = {
  us: {
    "409a": "409A Valuation",
    "gaap": "GAAP Standards",
    "none": "No Specific Standard"
  },
  uk: {
    "ifrs": "IFRS Standards",
    "frs": "FRS Standards",
    "none": "No Specific Standard"
  },
  eu: {
    "ifrs": "IFRS Standards",
    "none": "No Specific Standard"
  },
  india: {
    "ibbi": "IBBI Guidelines",
    "mca": "MCA Regulations",
    "none": "No Specific Standard"
  },
  other: {
    "ifrs": "IFRS Standards",
    "none": "No Specific Standard"
  }
};