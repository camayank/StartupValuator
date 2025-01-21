import { useState } from "react";
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
import { Info, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Form sections configuration matching the screenshots
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

export function ValuationForm({ onResult }: { onResult: (data: ValuationFormData) => void }) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = formSections.length;
  const progress = Math.round((currentStep / totalSteps) * 100);

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
        <div className="flex-1">
          <div className="h-2 bg-primary rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-muted-foreground">{progress}% Complete</span>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(mutation.mutate)} className="space-y-8">
              {currentStep <= totalSteps && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium">{formSections[currentStep -1].title}</h2>
                  {formSections[currentStep -1].subtitle && <p className="text-sm text-muted-foreground">{formSections[currentStep -1].subtitle}</p>}

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
                                  onChange={(e) => formField.onChange(e.target.value ? Number(e.target.value) : 0)}
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
                                    {field.name === "sector" && (
                                      <>
                                        <SelectItem value="technology">Technology</SelectItem>
                                        <SelectItem value="healthcare">Healthcare</SelectItem>
                                        <SelectItem value="finance">Finance</SelectItem>
                                      </>
                                    )}
                                    {field.name === "industry" && (
                                      <>
                                        <SelectItem value="software">Software</SelectItem>
                                        <SelectItem value="biotech">Biotech</SelectItem>
                                        <SelectItem value="fintech">Fintech</SelectItem>
                                      </>
                                    )}
                                    {field.name === "geographicMarkets" && (
                                      <>
                                        <SelectItem value="local">Local</SelectItem>
                                        <SelectItem value="regional">Regional</SelectItem>
                                        <SelectItem value="national">National</SelectItem>
                                        <SelectItem value="international">International</SelectItem>
                                      </>
                                    )}
                                    {field.name === "revenueModel" && (
                                      <>
                                        <SelectItem value="subscription">Subscription</SelectItem>
                                        <SelectItem value="transactional">Transactional</SelectItem>
                                        <SelectItem value="marketplace">Marketplace</SelectItem>
                                        <SelectItem value="advertising">Advertising</SelectItem>
                                      </>
                                    )}
                                    {field.name === "productStage" && (
                                      <>
                                        <SelectItem value="concept">Concept</SelectItem>
                                        <SelectItem value="mvp">MVP</SelectItem>
                                        <SelectItem value="beta">Beta</SelectItem>
                                        <SelectItem value="production">Production</SelectItem>
                                      </>
                                    )}
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
                </div>
              )}

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
                    onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                  >
                    Next
                  </Button>
                )}
                {currentStep === totalSteps && (
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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