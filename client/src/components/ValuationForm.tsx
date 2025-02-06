import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, HelpCircle, ChevronRight, AlertCircle, CheckCircle2, Building, TrendingUp, DollarSign, Box, ShieldAlert, Calculator, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { valuationFormSchema } from "@/lib/validations";
import type { ValuationFormData } from "@/lib/validations";
import { FormLoadingSkeleton } from "@/components/ui/form-loading-skeleton";
import {
  productStages,
  businessModels,
  sectors,
  industrySegments,
  technologyStacks,
  businessRisks,
  fundUtilizationOptions,
  marketSizeMultipliers,
  growthRateEstimates
} from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { BUSINESS_SECTORS, sectorOperations } from "@/lib/constants/business-sectors";

// Constants
const AUTOSAVE_DELAY = 2000; // 2 seconds delay for autosave

// Add new helper functions for intelligent defaults and calculations
const calculateFinancialMetrics = (revenue: number, stage: string, sector: string) => {
  const metrics = {
    cac: 0,
    ltv: 0,
    burnRate: 0,
    runway: 0,
  };

  // Calculate Customer Acquisition Cost (CAC)
  metrics.cac = revenue * 0.3; // Assume 30% of revenue goes to customer acquisition

  // Calculate Customer Lifetime Value (LTV)
  const multipliers = {
    concept: 2,
    prototype: 3,
    mvp: 4,
    beta: 5,
    growth: 6,
    scale: 7,
  };
  metrics.ltv = revenue * (multipliers[stage as keyof typeof multipliers] || 3);

  // Calculate Burn Rate based on sector and stage
  const burnRateFactors = {
    technology: 1.2,
    healthtech: 1.5,
    fintech: 1.3,
    ecommerce: 1.1,
  };
  metrics.burnRate = revenue * (burnRateFactors[sector as keyof typeof burnRateFactors] || 1.2);

  // Calculate Runway (in months)
  metrics.runway = 12; // Default to 12 months

  return metrics;
};

// Add validation helper
const validateFinancialMetrics = (values: any) => {
  const warnings = [];

  if (values.ltv < values.cac * 3) {
    warnings.push("LTV should ideally be at least 3x CAC for sustainable growth");
  }

  if (values.burnRate > values.revenue * 2) {
    warnings.push("Burn rate is significantly high compared to revenue");
  }

  return warnings;
};


export function ValuationForm({ onResult }: { onResult: (data: ValuationFormData) => void }) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [stepsCompleted, setStepsCompleted] = useState<Record<number, boolean>>({});
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ValuationFormData>({
    resolver: zodResolver(valuationFormSchema),
    defaultValues: {
      businessInfo: {
        name: "",
        sector: "",
        segment: "",
        subSegment: "",
        productStage: "concept",
        businessModel: "subscription",
      },
      marketData: {
        tam: 0,
        sam: 0,
        som: 0,
        growthRate: 0,
        competitors: [],
      },
      financialData: {
        revenue: 0,
        cac: 0,
        ltv: 0,
        burnRate: 0,
        runway: 0,
      },
      productDetails: {
        maturity: "concept",
        roadmap: "",
        technologyStack: "",
        differentiators: "",
        intellectualProperty: "none"
      },
      risksAndOpportunities: {
        risks: [],
        opportunities: [],
        mitigationStrategies: ""
      },
      valuationInputs: {
        targetValuation: 0,
        fundingRequired: 0,
        expectedROI: [],
        metrics: {}
      },
    },
  });

  // Simplified section markers for progress tracking
  const formProgress = {
    businessInfo: {
      title: "Business Profile",
      icon: <Building className="h-5 w-5" />,
      description: "Tell us about your business"
    },
    marketData: {
      title: "Market Analysis",
      icon: <TrendingUp className="h-5 w-5" />,
      description: "Define your market position"
    },
    financialData: {
      title: "Financial Metrics",
      icon: <DollarSign className="h-5 w-5" />,
      description: "Key financial indicators"
    },
    productDetails: {
      title: "Product Details",
      icon: <Box className="h-5 w-5" />,
      description: "Your product/service offering"
    },
    risksOpportunities: {
      title: "Risk Assessment",
      icon: <ShieldAlert className="h-5 w-5" />,
      description: "Evaluate risks and opportunities"
    },
    valuationInputs: {
      title: "Valuation Inputs",
      icon: <Calculator className="h-5 w-5" />,
      description: "Final valuation parameters"
    }
  };

  // Progress bar component
  const ProgressIndicator = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {Object.entries(formProgress).map(([key, section], index) => (
          <div
            key={key}
            className={cn(
              "flex flex-col items-center relative",
              "w-1/6",
              currentStep === index + 1 && "text-primary",
              stepsCompleted[index + 1] && "text-green-500"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-full border-2 flex items-center justify-center",
              "transition-all duration-200",
              currentStep === index + 1 && "border-primary bg-primary/10",
              stepsCompleted[index + 1] && "border-green-500 bg-green-500/10"
            )}>
              {section.icon}
            </div>
            <span className="text-xs mt-2 text-center font-medium">{section.title}</span>
          </div>
        ))}
      </div>
      <Progress value={(currentStep / Object.keys(formProgress).length) * 100} className="h-2" />
    </div>
  );

  // Section card with improved styling
  const SectionCard = ({ children, title, description }: { children: React.ReactNode, title: string, description: string }) => (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">{children}</div>
      </CardContent>
    </Card>
  );

  // Render the active section
  const renderActiveSection = () => {
    const sectionKey = Object.keys(formProgress)[currentStep - 1];
    const section = formProgress[sectionKey];
    if (!section) return null;

    const fields = getFieldsForSection(sectionKey);


    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <SectionCard title={section.title} description={section.description}>
          <div className="grid gap-6">
            {fields.map((fieldConfig) => (
              <FormField
                key={fieldConfig.name}
                control={form.control}
                name={fieldConfig.name}
                render={(field) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>
                        {fieldConfig.label}
                        {fieldConfig.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{fieldConfig.description}</p>
                            {fieldConfig.help && <p>{fieldConfig.help}</p>}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormControl>
                      {renderField({ field, fieldConfig })}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </SectionCard>
      </motion.div>
    );
  };

  const getFieldsForSection = (sectionId: string): any[] => {
    switch (sectionId) {
      case "businessInfo": return businessInfoFields;
      case "marketData": return marketDataFields;
      case "financialData": return financialDataFields;
      case "productDetails": return productDetailsFields;
      case "risksOpportunities": return risksOpportunitiesFields;
      case "valuationInputs": return valuationInputsFields;
      default: return [];
    }
  };

  // Update the businessInfoFields configuration
  const businessInfoFields = [
    {
      name: "businessInfo.name",
      label: "Business Name",
      type: "text",
      required: true,
      description: "Your company's legal or registered business name",
      placeholder: "e.g., TechStart Solutions Inc."
    },
    {
      name: "businessInfo.sector",
      label: "Business Sector",
      type: "dropdown",
      required: true,
      description: "Primary sector your business operates in",
      options: () => Object.keys(BUSINESS_SECTORS).map(sector => ({ value: sector, label: sector }))
    },
    {
      name: "businessInfo.segment",
      label: "Industry Segment",
      type: "dropdown",
      required: true,
      description: "Specific segment within your sector",
      disabled: !form.watch("businessInfo.sector"),
      options: () => {
        const sector = form.watch("businessInfo.sector");
        if (!sector) return [];
        return Object.keys(BUSINESS_SECTORS[sector] || {}).map(segment => ({ value: segment, label: segment }));
      }
    },
    {
      name: "businessInfo.subSegment",
      label: "Sub-Segment",
      type: "dropdown",
      required: true,
      description: "Specific sub-segment within your industry segment",
      disabled: !form.watch("businessInfo.segment"),
      options: () => {
        const sector = form.watch("businessInfo.sector");
        const segment = form.watch("businessInfo.segment");
        if (!sector || !segment) return [];
        return (BUSINESS_SECTORS[sector]?.[segment] || []).map(subSegment => ({ value: subSegment, label: subSegment }));
      }
    },
    {
      name: "businessInfo.businessModel",
      label: "Business Model",
      type: "dropdown",
      required: true,
      description: "How does your business generate revenue?",
      options: getBusinessModelOptions
    },
    {
      name: "businessInfo.productStage",
      label: "Product Stage",
      type: "dropdown",
      required: true,
      description: "Current stage of product development",
      options: getProductStageOptions
    }
  ];

  const marketDataFields = [
    {
      name: "marketData.tam",
      label: "Total Addressable Market (TAM)",
      type: "number",
      required: true,
      description: "Total market size in USD",
      help: "The total market demand for your product/service category"
    },
    {
      name: "marketData.sam",
      label: "Serviceable Addressable Market (SAM)",
      type: "number",
      required: true,
      description: "Portion of TAM you can realistically serve",
      help: "The segment of TAM that your business can actually reach"
    },
    {
      name: "marketData.som",
      label: "Serviceable Obtainable Market (SOM)",
      type: "number",
      required: true,
      description: "Market share you can capture",
      help: "Realistic portion of SAM you can capture in 3-5 years"
    },
    {
      name: "marketData.growthRate",
      label: "Market Growth Rate (%)",
      type: "number",
      required: true,
      description: "Annual market growth percentage",
      help: "Expected year-over-year growth rate of your target market"
    }
  ];

  const financialDataFields = [
    {
      name: "financialData.revenue",
      label: "Monthly Revenue",
      type: "number",
      required: true,
      description: "Current monthly revenue in USD",
      help: "Average monthly revenue from the last 3 months"
    },
    {
      name: "financialData.cac",
      label: "Customer Acquisition Cost (CAC)",
      type: "number",
      required: true,
      description: "Cost to acquire one customer",
      help: "Total sales & marketing costs divided by new customers"
    },
    {
      name: "financialData.ltv",
      label: "Customer Lifetime Value (LTV)",
      type: "number",
      required: true,
      description: "Average revenue per customer",
      help: "Expected total revenue from a typical customer"
    },
    {
      name: "financialData.burnRate",
      label: "Monthly Burn Rate",
      type: "number",
      required: true,
      description: "Monthly cash burn rate",
      help: "Average monthly expenses excluding one-time costs"
    },
    {
      name: "financialData.runway",
      label: "Runway (Months)",
      type: "number",
      required: true,
      description: "Number of months runway",
      help: "Number of months until company runs out of cash"
    }
  ];

  const productDetailsFields = [
    {
      name: "productDetails.maturity",
      label: "Product Stage",
      type: "dropdown",
      required: true,
      description: "Current development stage of your product",
      options: getProductStageOptions
    },
    {
      name: "productDetails.technologyStack",
      label: "Technology Stack",
      type: "multiselect",
      required: true,
      description: "Key technologies used in your product",
      help: "Select all major technologies/frameworks used",
      options: getTechnologyStackOptions
    },
    {
      name: "productDetails.intellectualProperty",
      label: "Intellectual Property",
      type: "dropdown",
      required: false,
      description: "Status of IP protection",
      help: "Patents, trademarks, or other IP protections",
      options: [
        ["none", "None"],
        ["patentPending", "Patent Pending"],
        ["patented", "Patented"],
        ["trademark", "Trademark"],
        ["other", "Other"]
      ]
    }
  ];

  const risksOpportunitiesFields = [
    {
      name: "risksAndOpportunities.risks",
      label: "Key Business Risks",
      type: "multiselect",
      required: true,
      description: "Major risks facing the business",
      help: "Select all significant risks to your business",
      options: getBusinessRisks
    },
    {
      name: "risksAndOpportunities.mitigationStrategies",
      label: "Risk Mitigation Strategies",
      type: "textarea",
      required: true,
      description: "Strategies to address key risks",
      help: "Describe how you plan to address each major risk"
    },
    {
      name: "risksAndOpportunities.opportunities",
      label: "Growth Opportunities",
      type: "multiselect",
      required: true,
      description: "Potential areas for growth",
      help: "Select key areas where you see growth potential",
      options: getBusinessRisks
    }
  ];

  const valuationInputsFields = [
    {
      name: "valuationInputs.targetValuation",
      label: "Target Valuation",
      type: "number",
      required: false,
      description: "Expected valuation range",
      help: "Your estimated company valuation (if any)"
    },
    {
      name: "valuationInputs.fundingRequired",
      label: "Funding Required",
      type: "number",
      required: true,
      description: "Amount of funding needed",
      help: "How much funding are you looking to raise?"
    },
    {
      name: "valuationInputs.expectedROI",
      label: "Use of Funds",
      type: "multiselect",
      required: true,
      description: "Planned use of raised funds",
      help: "Select how you plan to use the funding",
      options: getFundUtilizationOptions
    },
    {
      name: "valuationInputs.metrics",
      label: "Sector Metrics",
      type: "hidden"
    }
  ];

  // Update the Select component rendering
  const renderField = ({ field: formField, fieldConfig }: { field: any, fieldConfig: any }) => {
    switch (fieldConfig.type) {
      case "text":
        return (
          <Input {...formField} className="w-full" placeholder={fieldConfig.placeholder} />
        );
      case "number":
        return (
          <Input
            type="number"
            {...formField}
            className="w-full"
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : 0;
              formField.onChange(value);
            }}
          />
        );
      case "dropdown":
        const options = typeof fieldConfig.options === 'function' ? fieldConfig.options() : fieldConfig.options;
        return (
          <div className="w-full">
            <Select
              onValueChange={formField.onChange}
              value={formField.value || ""}
              disabled={fieldConfig.disabled}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${fieldConfig.label.toLowerCase()}`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options.map((option: any) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "multiselect":
        return (
          <Select
            multiple
            onValueChange={formField.onChange}
            defaultValue={formField.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${fieldConfig.label.toLowerCase()}`} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Array.isArray(fieldConfig.options) && fieldConfig.options.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "textarea":
        return (
          <textarea
            {...formField}
            className="w-full min-h-[100px] p-2 rounded-md border border-input"
            placeholder={fieldConfig.placeholder}
          />
        );
      default:
        return null;
    }
  };

  const { businessInfo } = form.getValues();
  const { sector: businessSector, businessModel, productStage } = businessInfo;
  const marketMetrics = calculateMarketMetrics(businessSector, productStage);

  useEffect(() => {
    form.setValue("marketData.tam", marketMetrics.tam);
    form.setValue("marketData.sam", marketMetrics.sam);
    form.setValue("marketData.som", marketMetrics.som);
    form.setValue("marketData.growthRate", marketMetrics.growthRate);
  }, [businessInfo, form]);


  useEffect(() => {
    const { sector, segment } = form.getValues().businessInfo;
    if (sector && segment) {
      const metrics = sectorOperations.getMetrics(sector, segment);
      if (metrics) {
        form.setValue("valuationInputs.metrics", metrics);
      }
    }
  }, [form.watch("businessInfo.sector"), form.watch("businessInfo.segment")]);

  useEffect(() => {
    const fundUtilizationSuggestions = suggestFundUtilization(productStage, form.getValues().valuationInputs.fundingRequired);
    const fundUtilizationOptions = getFundUtilizationOptions();
    const suggestedFundUtilization = fundUtilizationOptions.filter(option => fundUtilizationSuggestions.includes(option.value));
    form.setValue("valuationInputs.expectedROI", suggestedFundUtilization.map(o => o.value));

  }, [productStage, form.watch("valuationInputs.fundingRequired"), form]);

  const techStackSuggestions = suggestTechnologyStack(businessModel, businessSector);
  const technologyStackOptions = getTechnologyStackOptions();
  const suggestedTechnologyStack = technologyStackOptions.filter(option => Object.values(techStackSuggestions).flat().includes(option.value));


  useEffect(() => {
    form.setValue("productDetails.technologyStack", suggestedTechnologyStack.map(o => o.value));
  }, [businessInfo, businessSector, businessModel, form]);

  // Add effect for auto-calculating financial metrics
  useEffect(() => {
    const { businessInfo, financialData } = form.getValues();
    const { revenue } = financialData;
    const { sector, productStage } = businessInfo;

    if (revenue && sector && productStage) {
      const metrics = calculateFinancialMetrics(revenue, productStage, sector);

      // Only update if fields are empty or zero
      if (!financialData.cac || financialData.cac === 0) form.setValue("financialData.cac", metrics.cac);
      if (!financialData.ltv || financialData.ltv === 0) form.setValue("financialData.ltv", metrics.ltv);
      if (!financialData.burnRate || financialData.burnRate === 0) form.setValue("financialData.burnRate", metrics.burnRate);
      if (!financialData.runway || financialData.runway === 0) form.setValue("financialData.runway", metrics.runway);

      // Validate and show warnings
      const warnings = validateFinancialMetrics(metrics);
      setValidationWarnings(warnings);
    }
  }, [
    form.watch("businessInfo.sector"),
    form.watch("businessInfo.productStage"),
    form.watch("financialData.revenue"),
    form
  ]);

  // Update the render function to show validation warnings
  const renderValidationWarnings = () => {
    if (validationWarnings.length === 0) return null;

    return (
      <Alert variant="warning" className="mb-4">
        <AlertDescription>
          <ul className="list-disc pl-4">
            {validationWarnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    );
  };

  const mutation = useMutation({
    mutationFn: async (data: ValuationFormData) => {
      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: (data) => {
      onResult(data);
      localStorage.removeItem('valuationFormData');
      toast({
        title: "Success",
        description: "Your valuation report has been generated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate valuation report",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const savedData = localStorage.getItem('valuationFormData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        form.reset(parsedData);
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, [form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      const timeoutId = setTimeout(() => {
        localStorage.setItem('valuationFormData', JSON.stringify(value));
        toast({
          title: "Progress Saved",
          description: "Your changes have been automatically saved",
          duration: 2000,
        });
      }, AUTOSAVE_DELAY);

      return () => clearTimeout(timeoutId);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, toast]);

  useEffect(() => {
    const currentFields = getFieldsForSection(Object.keys(formProgress)[currentStep -1]);
    const formValues = form.getValues();

    const isStepComplete = currentFields.every((field) => {
      if (!field.required) return true;
      const value = formValues[field.name as keyof ValuationFormData];
      return value !== undefined && value !== "" && value !== 0 && (Array.isArray(value) ? value.length > 0 : true);
    });

    setStepsCompleted((prev) => ({ ...prev, [currentStep]: isStepComplete }));
  }, [form.watch(), currentStep, form]);


  if (mutation.isPending) {
    return <FormLoadingSkeleton />;
  }

  const totalSteps = Object.keys(formProgress).length;
  const progress = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(async (data) => {
          setIsSubmitting(true);
          try {
            await mutation.mutateAsync(data);
          } finally {
            setIsSubmitting(false);
          }
        })}>
          <ProgressIndicator />
          <AnimatePresence mode="wait">
            {renderActiveSection()}
          </AnimatePresence>

          {/* Navigation buttons with improved styling */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="w-32"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep < Object.keys(formProgress).length ? (
              <Button
                type="button"
                onClick={() => {
                  if (stepsCompleted[currentStep]) {
                    setCurrentStep(Math.min(Object.keys(formProgress).length, currentStep + 1));
                  } else {
                    toast({
                      title: "Please complete all required fields",
                      description: "Fill in the required information before proceeding",
                      variant: "destructive"
                    });
                  }
                }}
                className="w-32"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting || !Object.values(stepsCompleted).every(Boolean)}
                className="w-48"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    Generate Report
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

const getSectorOptions = () => Object.entries(sectors);
const getProductStageOptions = () => Object.entries(productStages);
const getBusinessModelOptions = () => Object.entries(businessModels);

const getTechnologyStackOptions = () =>
  Object.entries(technologyStacks).flatMap(([category, techs]) =>
    techs.map((tech) => ({ value: tech, label: tech, category }))
  );
const getBusinessRisks = () =>
  Object.entries(businessRisks).flatMap(([category, risks]) =>
    risks.map((risk) => ({ value: risk, label: risk, category }))
  );
const getFundUtilizationOptions = () =>
  Object.entries(fundUtilizationOptions).flatMap(([category, options]) =>
    options.map((option) => ({ value: option, label: option, category }))
  );

// Market size calculation helper
const calculateMarketMetrics = (sector: keyof typeof marketSizeMultipliers, stage: keyof typeof growthRateEstimates) => {
  const multipliers = marketSizeMultipliers[sector] || marketSizeMultipliers.technology;
  const growthRates = growthRateEstimates[stage] || growthRateEstimates.concept;

  return {
    tam: multipliers.tam,
    sam: multipliers.tam * multipliers.samPercent,
    som: multipliers.tam * multipliers.samPercent * multipliers.somPercent,
    growthRate: Math.floor(Math.random() * (growthRates.max - growthRates.min) + growthRates.min)
  };
};

// Technology stack suggestions based on business model and sector
const suggestTechnologyStack = (businessModel: string, sector: string) => {
  const suggestions = {
    frontend: ["React", "TypeScript"],
    backend: ["Node.js"],
    database: ["PostgreSQL"],
    cloud: ["AWS"],
    mobile: []
  };

  if (businessModel === "subscription") {
    suggestions.backend.push("Python/Django");
    suggestions.database.push("MongoDB");
  }

  if (sector === "enterprise") {
    suggestions.frontend.push("Angular");
    suggestions.backend.push("Java Spring");
  }

  return suggestions;
};

// Fund utilization suggestions based on stage and funding amount
const suggestFundUtilization = (stage: string, fundingRequired: number) => {
  const suggestions = [];

  if (stage === "concept" || stage === "prototype") {
    suggestions.push(...fundUtilizationOptions.product.slice(0, 2));
    suggestions.push(fundUtilizationOptions.operations[0]);
  }

  if (fundingRequired > 1000000) {
    suggestions.push(...fundUtilizationOptions.marketing.slice(0, 2));
    suggestions.push(...fundUtilizationOptions.growth.slice(0, 2));
  }

  return suggestions;
};

export default ValuationForm;