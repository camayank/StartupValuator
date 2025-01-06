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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Building2, Trophy, Globe2, Target, HelpCircle, Shield } from "lucide-react";
import { sectors, valuationPurposes, regions, complianceStandards } from "@/lib/validations";
import type { ValuationFormData } from "@/lib/validations";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BusinessInfoStepProps {
  data: Partial<ValuationFormData>;
  onUpdate: (data: Partial<ValuationFormData>) => void;
  onNext: () => void;
  currentStep: number;
  totalSteps: number;
}

const RegionSpecificFields = ({ region, onUpdate }: {
  region: keyof typeof regions;
  onUpdate: (data: Partial<ValuationFormData>) => void;
}) => {
  const standards = regions[region]?.standards || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 space-y-4"
    >
      <Alert>
        <AlertTitle className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Region-Specific Requirements
        </AlertTitle>
        <AlertDescription>
          {region === "india" && (
            "Please confirm ICAI compliance requirements for Indian valuations."
          )}
          {region === "us" && (
            "409A compliance check required for US-based valuations."
          )}
          {region === "eu" && (
            "IFRS standards will be applied for EU-based valuations."
          )}
        </AlertDescription>
      </Alert>

      <FormField
        name="complianceStandard"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Compliance Standards</FormLabel>
            <FormDescription>
              Required standards for {regions[region].name}
            </FormDescription>
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                onUpdate({ complianceStandard: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select compliance standard" />
              </SelectTrigger>
              <SelectContent>
                {standards.map((standard) => (
                  <SelectItem key={standard} value={standard}>
                    {complianceStandards[standard as keyof typeof complianceStandards]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
    </motion.div>
  );
};

export function BusinessInfoStep({ data, onUpdate, onNext, currentStep, totalSteps }: BusinessInfoStepProps) {
  const [selectedSector, setSelectedSector] = useState<string>(data.sector || "technology");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showOnboarding] = useState(!data.businessName); // Show onboarding if first time

  const form = useForm<Partial<ValuationFormData>>({
    defaultValues: {
      businessName: data.businessName || "",
      valuationPurpose: data.valuationPurpose || "fundraising",
      sector: data.sector || "technology",
      subsector: data.subsector || "",
      region: data.region || "us",
    },
  });

  const handleSectorChange = (value: string) => {
    setSelectedSector(value);
    form.setValue("sector", value as ValuationFormData["sector"]);
    // Reset subsector when sector changes
    form.setValue("subsector", "");
  };

  const handleSubmit = (values: Partial<ValuationFormData>) => {
    onUpdate(values);
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {showOnboarding && (
        <Alert className="bg-primary/5 border-primary/20">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-base">
            Welcome to our AI-powered startup valuation platform. Let's start by understanding your business context to provide the most accurate valuation.
          </AlertDescription>
        </Alert>
      )}

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-muted-foreground">Business Information</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Complete your business profile for an accurate valuation that meets global compliance standards.
        </AlertDescription>
      </Alert>

      <TooltipProvider>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Business Name
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Enter your company's registered business name
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <FormDescription>
                      The legal name of your business
                    </FormDescription>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="e.g., TechStart Solutions"
                          {...field}
                          className={`pl-8 transition-all duration-200 ${
                            focusedField === "businessName" ? "ring-2 ring-primary" : ""
                          }`}
                          onFocus={() => setFocusedField("businessName")}
                          onBlur={() => setFocusedField(null)}
                        />
                        <Building2 className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
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
                    <FormLabel>Purpose of Valuation</FormLabel>
                    <FormDescription>
                      This helps us tailor the valuation approach
                    </FormDescription>
                    <div className="relative">
                      <Trophy className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          onUpdate({ valuationPurpose: value as ValuationFormData["valuationPurpose"] });
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
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Sector</FormLabel>
                    <div className="relative">
                      <Globe2 className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                      <Select value={selectedSector} onValueChange={handleSectorChange}>
                        <SelectTrigger className="pl-8">
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedSector && (
                <FormField
                  control={form.control}
                  name="subsector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry Segment</FormLabel>
                      <div className="relative">
                        <Target className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            onUpdate({ subsector: value });
                          }}
                        >
                          <SelectTrigger className="pl-8">
                            <SelectValue placeholder="Select industry segment" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(sectors[selectedSector as keyof typeof sectors].subsectors).map(
                              ([key, { name }]) => (
                                <SelectItem key={key} value={key}>
                                  {name}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Region</FormLabel>
                    <FormDescription>
                      For region-specific valuation standards
                    </FormDescription>
                    <div className="relative">
                      <Globe2 className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          const region = value as keyof typeof regions;
                          field.onChange(region);
                          onUpdate({
                            region,
                            currency: regions[region].defaultCurrency,
                          });
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
                    </div>
                    {field.value && (
                      <RegionSpecificFields region={field.value as keyof typeof regions} onUpdate={onUpdate} />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between pt-6 border-t">
              <div /> {/* Empty div for spacing */}
              <Button type="submit">
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </TooltipProvider>
    </motion.div>
  );
}