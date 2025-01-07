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
import { Info, Building2, Trophy, Globe2, Users, Shield, Target, Scale, HelpCircle } from "lucide-react";
import { sectors, businessStages, regions, valuationPurposes } from "@/lib/validations";
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

export function BusinessInfoStep({ data, onUpdate, onNext, currentStep, totalSteps }: BusinessInfoStepProps) {
  const [selectedSector, setSelectedSector] = useState<string>(data.sector || "");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const form = useForm<Partial<ValuationFormData>>({
    defaultValues: {
      businessName: data.businessName || "",
      valuationPurpose: data.valuationPurpose || "fundraising",
      sector: data.sector || "technology",
      industry: data.industry || "",
      stage: data.stage || "ideation_unvalidated",
      region: data.region || "us",
      complianceStandard: data.complianceStandard || "none",
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
    form.setValue("sector", value as keyof typeof sectors);
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
    onUpdate({ stage: value });
  };

  const handleSubmit = (values: Partial<ValuationFormData>) => {
    onUpdate(values);
    onNext();
  };

  const handleRegionChange = (value: string) => {
    const region = value as keyof typeof regions;
    form.setValue("region", region);
    // Reset compliance standard when region changes
    form.setValue("complianceStandard", "none");
    onUpdate({
      region,
      currency: regions[region].defaultCurrency,
      complianceStandard: "none"
    });
  };

  const getAvailableStandards = () => {
    const region = form.getValues("region") as keyof typeof regionSpecificStandards;
    return regionSpecificStandards[region] || regionSpecificStandards.other;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
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
            <motion.div
              className="grid md:grid-cols-2 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="col-span-2 p-6 bg-card rounded-lg border shadow-sm space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Business Details
                </h3>

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
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-2 p-6 bg-card rounded-lg border shadow-sm space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Globe2 className="h-5 w-5" />
                  Market Position
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Sector</FormLabel>
                        <div className="relative">
                          <Globe2 className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                          <Select
                            value={selectedSector}
                            onValueChange={handleSectorChange}
                          >
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
                      </FormItem>
                    )}
                  />

                  {selectedSector && (
                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry Segment</FormLabel>
                          <div className="relative">
                            <Target className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                            <Select
                              value={field.value}
                              onValueChange={handleIndustryChange}
                            >
                              <SelectTrigger className="pl-8">
                                <SelectValue placeholder="Select industry" />
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
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              <div className="col-span-2 md:col-span-1 p-6 bg-card rounded-lg border shadow-sm space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Stage & Region
                </h3>

                <FormField
                  control={form.control}
                  name="stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Stage</FormLabel>
                      <div className="relative">
                        <Scale className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                        <Select
                          value={field.value}
                          onValueChange={handleStageChange}
                        >
                          <SelectTrigger className="pl-8">
                            <SelectValue placeholder="Select stage" />
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
                    </FormItem>
                  )}
                />

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
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="complianceStandard"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compliance Standard</FormLabel>
                      <FormDescription>
                        Choose the applicable valuation standard
                      </FormDescription>
                      <div className="relative">
                        <Shield className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
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
                            {Object.entries(getAvailableStandards()).map(([key, name]) => (
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
              </div>

              <div className="col-span-2 md:col-span-1 p-6 bg-card rounded-lg border shadow-sm space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team & Assets
                </h3>

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
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="intellectualProperty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IP Protection Status</FormLabel>
                      <div className="relative">
                        <Shield className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
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
                      </div>
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                type="submit"
                className="w-full mt-6"
              >
                Continue
              </Button>
            </motion.div>
          </form>
        </Form>
      </TooltipProvider>
    </motion.div>
  );
}