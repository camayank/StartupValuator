import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { valuationFormSchema } from "@/lib/validations";
import type { ValuationFormData } from "@/lib/validations";
import { Info, FileText, CheckCircle2, AlertCircle, HelpCircle, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Enhanced form sections configuration based on user requirements
const formSections = [
  {
    id: "businessInfo",
    title: "Business Information",
    subtitle: "Tell us about your business fundamentals",
    description: "Basic information about your company and its operations",
    fields: [
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
        help: "Choose the sector that best represents your core business activities"
      },
      { 
        name: "businessInfo.industry", 
        label: "Industry", 
        type: "dropdown", 
        required: true,
        description: "Specific industry within the sector",
        help: "Select the specific industry that matches your business model"
      },
      {
        name: "businessInfo.businessModel",
        label: "Business Model",
        type: "dropdown",
        required: true,
        description: "How your business generates revenue",
        help: "Common examples: SaaS, E-commerce, Marketplace, etc."
      }
    ]
  },
  {
    id: "marketData",
    title: "Market Information",
    subtitle: "Define your market opportunity and position",
    description: "Details about your target market and competitive landscape",
    fields: [
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
    ]
  },
  {
    id: "financialData",
    title: "Financial Metrics",
    subtitle: "Key financial indicators and metrics",
    description: "Current financial performance and metrics",
    fields: [
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
      }
    ]
  },
  {
    id: "productDetails",
    title: "Product Information",
    subtitle: "Details about your product/service offering",
    description: "Technical and operational aspects of your product",
    fields: [
      { 
        name: "productDetails.maturity", 
        label: "Product Stage", 
        type: "dropdown", 
        required: true,
        description: "Current development stage of your product",
        options: Object.entries(productStages)
      },
      { 
        name: "productDetails.technologyStack", 
        label: "Technology Stack", 
        type: "multiselect", 
        required: true,
        description: "Key technologies used in your product",
        help: "Select all major technologies/frameworks used"
      },
      { 
        name: "productDetails.intellectualProperty", 
        label: "Intellectual Property", 
        type: "dropdown", 
        required: false,
        description: "Status of IP protection",
        help: "Patents, trademarks, or other IP protections"
      }
    ]
  },
  {
    id: "risksOpportunities",
    title: "Risks & Opportunities",
    subtitle: "Evaluate potential risks and growth opportunities",
    description: "Assessment of business risks and growth potential",
    fields: [
      { 
        name: "risksAndOpportunities.risks", 
        label: "Key Business Risks", 
        type: "multiselect", 
        required: true,
        description: "Major risks facing the business",
        help: "Select all significant risks to your business"
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
        help: "Select key areas where you see growth potential"
      }
    ]
  },
  {
    id: "valuationInputs",
    title: "Valuation Parameters",
    subtitle: "Additional inputs for valuation calculation",
    description: "Factors affecting the final valuation",
    fields: [
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
        help: "Select how you plan to use the funding"
      }
    ]
  }
];

const AUTOSAVE_DELAY = 1000; // 1 second

const defaultValues: ValuationFormData = {
  businessInfo: {
    name: "",
    sector: "",
    industry: "",
    location: "",
    productStage: "concept",
    businessModel: "subscription"
  },
  marketData: {
    tam: 0,
    sam: 0,
    som: 0,
    growthRate: 0,
    competitors: []
  },
  financialData: {
    revenue: 0,
    cac: 0,
    ltv: 0,
    burnRate: 0,
    runway: 0
  },
  productDetails: {
    maturity: "",
    roadmap: "",
    technologyStack: "",
    differentiators: ""
  },
  risksAndOpportunities: {
    risks: [],
    opportunities: []
  },
  valuationInputs: {
    targetValuation: 0,
    fundingRequired: 0,
    expectedROI: 0
  }
};

export function ValuationForm({ onResult }: { onResult: (data: ValuationFormData) => void }) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = formSections.length;
  const progress = Math.round((currentStep / totalSteps) * 100);
  const [stepsCompleted, setStepsCompleted] = useState<Record<number, boolean>>({});
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  const form = useForm<ValuationFormData>({
    resolver: zodResolver(valuationFormSchema),
    defaultValues: defaultValues,
  });

  // Load saved form data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('valuationFormData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      form.reset(parsedData);
      setSelectedSector(parsedData.businessInfo?.sector || null);
    }
  }, [form]);

  // Enhanced auto-save with status indicator
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

  // Enhanced step completion check
  useEffect(() => {
    const currentFields = formSections[currentStep - 1].fields;
    const formValues = form.getValues();

    const isStepComplete = currentFields.every(field => {
      if (!field.required) return true;
      const value = formValues[field.name as keyof ValuationFormData];
      return value !== undefined && value !== "" && value !== 0;
    });

    setStepsCompleted(prev => ({
      ...prev,
      [currentStep]: isStepComplete
    }));
  }, [form.watch(), currentStep]);

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
      localStorage.removeItem('valuationFormData'); // Clear saved data
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

  const getSectionColor = (sectionId: string) => {
    const colors = {
      businessInfo: "border-blue-500/20 bg-blue-50/30",
      marketData: "border-green-500/20 bg-green-50/30",
      financialData: "border-purple-500/20 bg-purple-50/30",
      productDetails: "border-orange-500/20 bg-orange-50/30",
      risksOpportunities: "border-red-500/20 bg-red-50/30",
      valuationInputs: "border-teal-500/20 bg-teal-50/30"
    };
    return colors[sectionId as keyof typeof colors] || "";
  };

  const getSectionIcon = (sectionId: string) => {
    switch(sectionId) {
      case 'businessInfo': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'marketData': return <ChevronRight className="h-5 w-5 text-green-500" />;
      case 'financialData': return <FileText className="h-5 w-5 text-purple-500" />;
      case 'productDetails': return <FileText className="h-5 w-5 text-orange-500" />;
      case 'risksOpportunities': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'valuationInputs': return <FileText className="h-5 w-5 text-teal-500" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  return (
    <div className="max-w-[800px] mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Startup Valuation Assessment</h1>
          <p className="text-sm text-muted-foreground">Complete all sections for a comprehensive valuation report</p>
        </div>
      </div>

      {/* Enhanced progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-muted-foreground">{progress}% Complete</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-secondary h-2 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(mutation.mutate)} className="space-y-8">
          <Accordion type="single" defaultValue={`section-${currentStep}`} collapsible>
            {formSections.map((section, index) => (
              <AccordionItem 
                key={section.id} 
                value={`section-${index + 1}`}
                className={cn(
                  "border rounded-lg overflow-hidden transition-all",
                  getSectionColor(section.id),
                  stepsCompleted[index + 1] && "border-green-500/50"
                )}
              >
                <AccordionTrigger className="px-4 py-2 hover:no-underline">
                  <div className="flex items-center gap-3">
                    {getSectionIcon(section.id)}
                    <div>
                      <h3 className="text-lg font-medium text-left">{section.title}</h3>
                      <p className="text-sm text-muted-foreground text-left">{section.subtitle}</p>
                    </div>
                    {stepsCompleted[index + 1] && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardContent className="p-0 pt-4">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`section-${index}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-6"
                        >
                          <div className="grid gap-6">
                            {section.fields.map((field) => (
                              <FormField
                                key={field.name}
                                control={form.control}
                                name={field.name as keyof ValuationFormData}
                                render={({ field: formField }) => (
                                  <FormItem className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <FormLabel className="text-sm font-medium">
                                        {field.label}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                      </FormLabel>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <div className="space-y-2">
                                              <p className="font-medium">{field.description}</p>
                                              {field.help && (
                                                <p className="text-sm text-muted-foreground">{field.help}</p>
                                              )}
                                            </div>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>

                                    <FormControl>
                                      {field.type === "text" && (
                                        <Input 
                                          {...formField}
                                          className="w-full"
                                        />
                                      )}
                                      {field.type === "number" && (
                                        <Input
                                          type="number"
                                          {...formField}
                                          className="w-full"
                                          onChange={(e) => {
                                            const value = e.target.value ? Number(e.target.value) : 0;
                                            formField.onChange(value);
                                          }}
                                        />
                                      )}
                                      {field.type === "dropdown" && (
                                        <Select
                                          onValueChange={formField.onChange}
                                          defaultValue={formField.value}
                                        >
                                          <FormControl>
                                            <SelectTrigger className="w-full">
                                              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {field.options?.map(([key, value]) => (
                                              <SelectItem key={key} value={key}>
                                                {value}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      )}
                                      {field.type === "textarea" && (
                                        <textarea
                                          {...formField}
                                          className="w-full min-h-[100px] p-2 rounded-md border border-input"
                                          placeholder={field.placeholder}
                                        />
                                      )}
                                    </FormControl>
                                    <FormMessage />
                                    {field.help && (
                                      <FormDescription className="text-xs">
                                        {field.help}
                                      </FormDescription>
                                    )}
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="flex justify-between mt-6 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={() => {
                  if (stepsCompleted[currentStep]) {
                    setCurrentStep(Math.min(totalSteps, currentStep + 1));
                  } else {
                    toast({
                      title: "Incomplete Step",
                      description: "Please fill in all required fields before proceeding",
                      variant: "destructive"
                    });
                  }
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={mutation.isPending || !Object.values(stepsCompleted).every(Boolean)}
                className="gap-2"
              >
                {mutation.isPending ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <AlertCircle className="h-4 w-4" />
                    </motion.div>
                    Generating Report...
                  </>
                ) : (
                  'Generate Valuation Report'
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

export default ValuationForm;