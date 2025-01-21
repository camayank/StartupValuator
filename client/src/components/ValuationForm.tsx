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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { valuationFormSchema } from "@/lib/validations";
import type { ValuationFormData } from "@/lib/validations";
import { Info, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { sectors, industries } from "@/lib/validations";

// Form sections configuration
const formSections = [
  {
    title: "Business Information",
    subtitle: "Enter your business details to begin the valuation process",
    fields: [
      { 
        name: "businessName", 
        label: "Business Name", 
        type: "text", 
        required: true,
        description: "e.g., TechStart Solutions",
        placeholder: "e.g., TechStart Solutions"
      },
      { 
        name: "sector", 
        label: "Business Sector", 
        type: "dropdown", 
        required: true,
        description: "Primary sector of operation"
      },
      { 
        name: "industry", 
        label: "Industry", 
        type: "dropdown", 
        required: true,
        description: "Specific industry within the sector"
      }
    ]
  },
  {
    title: "Market Information",
    fields: [
      { 
        name: "geographicMarkets", 
        label: "Geographic Markets", 
        type: "dropdown", 
        required: true,
        description: "Main geographic areas of operation"
      },
      { 
        name: "revenueModel", 
        label: "Revenue Model", 
        type: "dropdown", 
        required: true,
        description: "Primary revenue generation model"
      },
      { 
        name: "productStage", 
        label: "Product Stage", 
        type: "dropdown", 
        required: true,
        description: "Current development stage"
      }
    ]
  },
  {
    title: "Team and Operations",
    fields: [
      { 
        name: "numberOfEmployees", 
        label: "Number of Employees", 
        type: "number", 
        required: true,
        description: "Total full-time employees"
      },
      { 
        name: "teamExperience", 
        label: "Team Experience (years)", 
        type: "number", 
        required: true,
        description: "Average years of relevant experience"
      }
    ]
  },
  {
    title: "Additional Information",
    fields: [
      { 
        name: "businessScalability", 
        label: "Business Scalability", 
        type: "dropdown", 
        required: false,
        description: "Potential for growth and expansion"
      },
      { 
        name: "currentCustomerBase", 
        label: "Current Customer Base", 
        type: "number", 
        required: false,
        description: "Number of active customers"
      },
      { 
        name: "regulatoryCompliance", 
        label: "Regulatory Compliance", 
        type: "dropdown", 
        required: false,
        description: "Status of regulatory requirements"
      },
      { 
        name: "ipProtectionStatus", 
        label: "IP Protection Status", 
        type: "dropdown", 
        required: false,
        description: "Intellectual property protection level"
      }
    ]
  }
];

const AUTOSAVE_DELAY = 1000; // 1 second

export function ValuationForm({ onResult }: { onResult: (data: ValuationFormData) => void }) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = formSections.length;
  const progress = Math.round((currentStep / totalSteps) * 100);
  const [stepsCompleted, setStepsCompleted] = useState<Record<number, boolean>>({});
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  const form = useForm<ValuationFormData>({
    resolver: zodResolver(valuationFormSchema),
    defaultValues: {
      businessName: "",
      sector: "",
      industry: "",
      numberOfEmployees: 0,
      teamExperience: 0,
      currentCustomerBase: 0,
      businessScalability: "moderate",
      regulatoryCompliance: "notRequired",
      ipProtectionStatus: "none"
    }
  });

  // Load saved form data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('valuationFormData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      form.reset(parsedData);
      setSelectedSector(parsedData.sector || null);
    }
  }, [form]);

  // Auto-save form data
  useEffect(() => {
    const subscription = form.watch((value) => {
      const timeoutId = setTimeout(() => {
        localStorage.setItem('valuationFormData', JSON.stringify(value));
      }, AUTOSAVE_DELAY);

      return () => clearTimeout(timeoutId);
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Check step completion
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
        description: "Valuation has been calculated.",
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

  // Get available industries based on selected sector
  const getAvailableIndustries = () => {
    if (!selectedSector) return [];
    const sectorData = sectors[selectedSector as keyof typeof sectors];
    return sectorData ? Object.entries(sectorData.subsectors) : [];
  };

  return (
    <div className="max-w-[800px] mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Business Profile</h1>
          <p className="text-sm text-muted-foreground">Company information and market position</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="h-4 w-4" />
          Preview
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 bg-secondary h-2 rounded-full">
          <motion.div 
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-muted-foreground">
            {progress}% Complete
          </span>
          {stepsCompleted[currentStep] && (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(mutation.mutate)} className="space-y-8">
              <AnimatePresence mode="wait">
                {currentStep <= totalSteps && (
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <h2 className="text-lg font-medium">{formSections[currentStep -1].title}</h2>
                    {formSections[currentStep -1].subtitle && (
                      <p className="text-sm text-muted-foreground">{formSections[currentStep -1].subtitle}</p>
                    )}

                    <div className="grid gap-6">
                      {formSections[currentStep - 1].fields.map((field) => (
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
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-sm">{field.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <FormControl>
                                {field.type === "text" && (
                                  <Input 
                                    {...formField} 
                                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                                    className="w-full"
                                  />
                                )}
                                {field.type === "number" && (
                                  <Input
                                    type="number"
                                    {...formField}
                                    className="w-full"
                                    placeholder="0"
                                    onChange={(e) => {
                                      const value = e.target.value ? Number(e.target.value) : 0;
                                      formField.onChange(value);
                                      if (field.name === 'numberOfEmployees' && value > 1000) {
                                        toast({
                                          title: "Large Team",
                                          description: "Consider providing more details about team structure",
                                          variant: "default"
                                        });
                                      }
                                    }}
                                  />
                                )}
                                {field.type === "dropdown" && (
                                  <Select
                                    onValueChange={(value) => {
                                      formField.onChange(value);
                                      if (field.name === 'sector') {
                                        setSelectedSector(value);
                                        // Reset industry when sector changes
                                        form.setValue('industry', '');
                                      }
                                    }}
                                    defaultValue={formField.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {field.name === "sector" && 
                                        Object.entries(sectors).map(([key, value]) => (
                                          <SelectItem key={key} value={key}>
                                            {value.name}
                                          </SelectItem>
                                        ))
                                      }
                                      {field.name === "industry" && 
                                        getAvailableIndustries().map(([key, value]) => (
                                          <SelectItem key={key} value={key}>
                                            {value}
                                          </SelectItem>
                                        ))
                                      }
                                      {field.name === "businessScalability" && (
                                        <>
                                          <SelectItem value="low">Low</SelectItem>
                                          <SelectItem value="moderate">Moderate</SelectItem>
                                          <SelectItem value="high">High</SelectItem>
                                        </>
                                      )}
                                      {field.name === "regulatoryCompliance" && (
                                        <>
                                          <SelectItem value="notRequired">Not Required</SelectItem>
                                          <SelectItem value="inProgress">In Progress</SelectItem>
                                          <SelectItem value="compliant">Compliant</SelectItem>
                                        </>
                                      )}
                                      {field.name === "ipProtectionStatus" && (
                                        <>
                                          <SelectItem value="none">None</SelectItem>
                                          <SelectItem value="pending">Pending</SelectItem>
                                          <SelectItem value="registered">Registered</SelectItem>
                                        </>
                                      )}
                                    </SelectContent>
                                  </Select>
                                )}
                              </FormControl>
                              <FormMessage />
                              {field.description && (
                                <FormDescription className="text-xs text-muted-foreground">
                                  {field.description}
                                </FormDescription>
                              )}
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between mt-6 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                {currentStep < totalSteps && (
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
                )}
                {currentStep === totalSteps && (
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
                        Calculating...
                      </>
                    ) : (
                      'Calculate Valuation'
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ValuationForm;