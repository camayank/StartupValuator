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
import { useFieldValidation } from "@/hooks/use-field-validation";

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

  const validationContext = {
    sector: selectedSector,
    stage: data.stage,
  };

  const { validateField, isFieldRequired } = useFieldValidation(validationContext);

  const form = useForm<ValuationFormData>({
    defaultValues: {
      businessName: data.businessName || "",
      sector: data.sector || undefined,
      industry: data.industry || undefined,
      stage: data.stage || "ideation_validated",
      intellectualProperty: data.intellectualProperty || "none",
      teamExperience: data.teamExperience || 0,
      customerBase: data.customerBase || 0,
      competitiveDifferentiation: data.competitiveDifferentiation || "medium",
      regulatoryCompliance: data.regulatoryCompliance || "notRequired",
      scalability: data.scalability || "moderate",
    },
  });

  const handleSubmit = async (values: ValuationFormData) => {
    try {
      // Validate required fields
      if (!values.businessName?.trim()) {
        toast({
          title: "Business Name Required",
          description: "Please enter your business name to continue",
          variant: "destructive",
        });
        return;
      }

      if (!values.sector) {
        toast({
          title: "Sector Selection Required",
          description: "Please select your business sector to continue",
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
    if (value && sectors[value as keyof typeof sectors]) {
      setSelectedSector(value);
    }
  };

  const handleRegionChange = (value: string) => {
    if (value && regions[value as keyof typeof regions]) {
      const region = value as keyof typeof regions;
      form.setValue("region", region);
      form.setValue("complianceStandard", undefined);
      onUpdate({
        region,
        currency: regions[region].defaultCurrency,
        complianceStandard: undefined
      });
    }
  };

  const handleStageChange = (value: string) => {
    if (value && businessStages[value as keyof typeof businessStages]) {
      form.setValue("stage", value as ValuationFormData["stage"]);
      onUpdate({ stage: value as ValuationFormData["stage"] });
    }
  };

  const handleIndustryChange = (value: string) => {
    if (value && selectedSector) {
      const sectorData = sectors[selectedSector as keyof typeof sectors];
      if (sectorData && value in sectorData.subsectors) {
        form.setValue("industry", value);
        onUpdate({ industry: value });
      }
    }
  };

  useEffect(() => {
    const stage = form.getValues("stage");
    //Removed suggestion logic as it's not relevant to the edit.
  }, [selectedSector, form.watch("stage")]);

  return (
    <div className="space-y-6">
      <Alert className="bg-primary/5 border-primary/10">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-primary/90">
          Start by entering your basic business information. You can add more details in the next steps.
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
                    <FormDescription>
                      Enter the legal or trading name of your business
                    </FormDescription>
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

              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Sector *</FormLabel>
                    <FormDescription>
                      Choose the primary sector that best describes your business
                    </FormDescription>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleSectorChange(value);
                      }}
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Select
                            value={field.value}
                            onValueChange={handleIndustryChange}
                            disabled={!selectedSector}
                          >
                            <SelectTrigger className="pl-8">
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
                          <Building2 className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Select your specific industry within the chosen sector
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="intellectualProperty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IP Protection Status *</FormLabel>
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
                      <FormDescription>
                        Current status of your intellectual property protection
                      </FormDescription>
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
              </div>

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
                    <FormLabel>Competitive Differentiation *</FormLabel>
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
                    <FormLabel>Business Scalability *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            onUpdate({ scalability: value as ValuationFormData['scalability'] });
                          }}
                        >
                          <SelectTrigger className="pl-8">
                            <SelectValue placeholder="Select scalability potential" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="limited">Limited Scale Potential</SelectItem>
                            <SelectItem value="moderate">Moderate Scalability</SelectItem>
                            <SelectItem value="high">Highly Scalable</SelectItem>
                          </SelectContent>
                        </Select>
                        <Scale className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Assess your business's potential for growth and expansion
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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