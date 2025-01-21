import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { valuationFormSchema } from "@/lib/validations";
import type { ValuationFormData } from "@/lib/validations";
import { useFormAutoSave } from "@/hooks/use-form-autosave";
import { ErrorDisplay } from "@/components/ui/error-display";
import { ProgressFeedback } from "@/components/ui/progress-feedback";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Calculator, ChartBar, ClipboardCheck, Globe } from "lucide-react";
import SmartSlider from "@/components/ui/smart-slider";
import BusinessRulesEngine from "@/lib/business-rules-engine";
import { CollapsibleSection } from "@/components/ui/collapsible-section";

// Form sections configuration
const formSections = [
  {
    title: "Company Information",
    description: "Basic details about your company",
    fields: ["businessName", "sector", "industry", "stage"],
    defaultOpen: true,
  },
  {
    title: "Market & Revenue",
    description: "Market presence and revenue details",
    fields: ["geographicMarkets", "revenueModel", "productStage", "revenue", "currency"],
  },
  {
    title: "Team & Operations",
    description: "Team size and operational details",
    fields: ["employeeCount", "teamExperience", "customerBase"],
  },
  {
    title: "Growth & Compliance",
    description: "Growth potential and regulatory compliance",
    fields: ["scalability", "intellectualProperty", "regulatoryCompliance", "competitiveDifferentiation"],
  },
  {
    title: "Financial Metrics",
    description: "Key financial indicators",
    fields: ["growthRate", "margins", "fundingHistory"],
  },
];

// Navigation utilities
const TOTAL_STEPS = 5;

function useNavigation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const canGoBack = currentStep > 1;
  const canGoForward = currentStep < TOTAL_STEPS;
  const isLastStep = currentStep === TOTAL_STEPS;

  const handleNext = () => {
    if (canGoForward) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (canGoBack) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const markStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }
    handleNext();
  };

  return {
    currentStep,
    completedSteps,
    canGoBack,
    canGoForward,
    isLastStep,
    handleNext,
    handleBack,
    markStepComplete,
  };
}

interface ValuationFormProps {
  onResult: (data: ValuationFormData) => void;
}

export function ValuationForm({ onResult }: ValuationFormProps) {
  const { toast } = useToast();
  const navigation = useNavigation();
  const [validations, setValidations] = useState<Map<string, BusinessRulesEngine.ValidationResult>>(new Map());

  const form = useForm<ValuationFormData>({
    resolver: zodResolver(valuationFormSchema),
    defaultValues: {
      businessName: "",
      sector: "technology",
      industry: "software_enterprise",
      stage: "ideation_validated",
      employeeCount: 1,
      fundingHistory: {
        rounds: [],
        totalRaised: 0
      },
      revenueModel: "subscription",
      geographicMarkets: ["local"],
      productStage: "concept",
      intellectualProperty: "none",
      revenue: 0,
      teamExperience: 0,
      customerBase: 0,
      competitiveDifferentiation: "medium",
      regulatoryCompliance: "notRequired",
      scalability: "moderate",
      currency: "USD",
      growthRate: 0,
      margins: 0,
      region: "global",
      valuationPurpose: "fundraising",
      complianceStandard: "",
    },
  });

  // Watch form values for validation
  const formValues = form.watch();
  useEffect(() => {
    const validationResults = BusinessRulesEngine.validateForm(formValues);
    setValidations(validationResults);
  }, [formValues]);

  // Initialize auto-save functionality
  const { loadSavedData, clearSavedData } = useFormAutoSave(formValues);

  // Load saved data on mount
  useEffect(() => {
    const savedData = loadSavedData();
    if (savedData) {
      try {
        const parsedData = valuationFormSchema.parse(savedData);
        Object.keys(parsedData).forEach((key) => {
          form.setValue(key as keyof ValuationFormData, parsedData[key as keyof ValuationFormData]);
        });
      } catch (error) {
        console.error('Invalid saved form data:', error);
        clearSavedData();
      }
    }
  }, []);

  const mutation = useMutation({
    mutationFn: async (data: ValuationFormData) => {
      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: (data) => {
      clearSavedData();
      onResult(data);
      toast({
        title: "Success",
        description: "Your startup valuation has been calculated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to calculate valuation",
        variant: "destructive",
      });
    },
  });

  const handleStepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // For non-final steps, just validate and proceed
    if (!navigation.isLastStep) {
      const isValid = await form.trigger();
      if (isValid) {
        navigation.markStepComplete(navigation.currentStep);
      }
      return;
    }

    // For final step, submit the form
    try {
      const isValid = await form.trigger();
      if (!isValid) {
        toast({
          title: "Validation Error",
          description: "Please check the form for errors",
          variant: "destructive",
        });
        return;
      }

      const formData = form.getValues();
      await mutation.mutateAsync(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Welcome screen
  if (navigation.currentStep === 0) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-2xl mx-auto"
      >
        <Card className="overflow-hidden">
          <CardHeader className="text-center pb-6 md:pb-8">
            <motion.div variants={itemVariants}>
              <CardTitle className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Welcome to the Valuation Wizard</CardTitle>
              <p className="text-base md:text-lg text-muted-foreground">
                Let's guide you through the process of valuing your business using our AI-powered platform.
              </p>
            </motion.div>
          </CardHeader>
          <CardContent className="space-y-6 md:space-y-8">
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
            >
              {[
                {
                  title: "Business Information",
                  desc: "Tell us about your business type and stage",
                  icon: Building2
                },
                {
                  title: "Region & Standards",
                  desc: "Select your region and applicable standards",
                  icon: Globe
                },
                {
                  title: "Valuation Method",
                  desc: "Review region-specific valuation approaches",
                  icon: Calculator
                },
                {
                  title: "Financial Details",
                  desc: "Provide basic financial information",
                  icon: ChartBar
                },
                {
                  title: "Review",
                  desc: "Review and confirm your information",
                  icon: ClipboardCheck
                }
              ].map((step, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <Card className="transition-all duration-300 group-hover:shadow-md border-2 group-hover:border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-primary/5 text-primary">
                          <step.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                          <p className="text-sm text-muted-foreground">{step.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
            <motion.div variants={itemVariants} className="pt-2 md:pt-4">
              <Button
                onClick={() => navigation.handleNext()}
                className="w-full py-4 md:py-6 text-base md:text-lg"
                variant="default"
              >
                Get Started
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Render form sections
  const renderFormSection = (section: typeof formSections[0]) => {
    return (
      <CollapsibleSection
        key={section.title}
        title={section.title}
        description={section.description}
        defaultOpen={section.defaultOpen}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {section.fields.map((fieldName) => (
            <FormField
              key={fieldName}
              control={form.control}
              name={fieldName as keyof ValuationFormData}
              render={({ field }) => {
                const inputType = fieldName === "revenue" ? "number" : "text";
                const onChange = fieldName === "revenue" ? (e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value ? Number(e.target.value) : 0) : field.onChange;


                return (
                  <FormItem>
                    <FormLabel>{fieldName}</FormLabel>
                    <FormControl>
                      {fieldName === "growthRate" || fieldName === "margins" || fieldName === "teamExperience" ? (
                        <SmartSlider
                          label={fieldName === "growthRate" ? "Annual Growth Rate (%)" : fieldName === "margins" ? "Profit Margins (%)" : "Team Experience Level"}
                          value={field.value}
                          onChange={value => field.onChange(value)}
                          min={fieldName === "growthRate" ? 0 : fieldName === "margins" ? -50 : 0}
                          max={fieldName === "growthRate" ? 200 : fieldName === "margins" ? 100 : 100}
                          step={fieldName === "growthRate" ? 5 : fieldName === "margins" ? 5 : 10}
                          benchmarks={
                            fieldName === "growthRate" ? [
                              { value: 20, label: "Steady", description: "Stable, sustainable growth" },
                              { value: 50, label: "Fast", description: "Rapid expansion phase" },
                              { value: 100, label: "Hyper", description: "Exponential growth" },
                              { value: 200, label: "Unicorn", description: "Exceptional performance" }
                            ] : fieldName === "margins" ? [
                              { value: 0, label: "Break-even", description: "Revenue equals costs" },
                              { value: 20, label: "Healthy", description: "Sustainable profitability" },
                              { value: 50, label: "Premium", description: "High-margin business" },
                              { value: 80, label: "Elite", description: "Industry-leading efficiency" }
                            ] : [
                              { value: 25, label: "Early", description: "Growing expertise" },
                              { value: 50, label: "Mid", description: "Established track record" },
                              { value: 75, label: "Senior", description: "Industry veterans" },
                              { value: 100, label: "Expert", description: "World-class leadership" }
                            ]
                          }
                          tooltip={{
                            title: fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
                            description: fieldName === "growthRate" ? "Annual revenue growth as a percentage. Industry standards vary by sector and stage." : fieldName === "margins" ? "Net profit as a percentage of revenue. Higher margins often indicate stronger business models." : "Combined expertise and industry experience of the core team."
                          }}
                          className="mb-6"
                        />
                      ) : fieldName === "currency" ? (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input type={inputType} {...field} onChange={onChange} />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          ))}
        </div>
      </CollapsibleSection>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={handleStepSubmit} className="space-y-4 max-w-4xl mx-auto">
        <ErrorDisplay
          validations={validations}
          onDismiss={() => setValidations(new Map())}
        />

        {formSections.map(renderFormSection)}

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full md:w-auto"
          >
            {mutation.isPending ? "Calculating..." : "Calculate Valuation"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
};

export default ValuationForm;