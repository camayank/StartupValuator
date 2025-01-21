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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertCircle, HelpCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useApiWithRetry } from "@/hooks/use-api-with-retry";
import ValidationEngine from "@/lib/validation-engine";
import ErrorHandler from "@/lib/error-handler";
import type { ValuationFormData } from "@/lib/validations";
import { sectors, businessStages } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DebugHelper from "@/lib/debug-helper";

// Create validation schema with proper industry validation
const createFormSchema = (selectedSector: string) => z.object({
  businessName: z.string()
    .min(1, "Business name is required")
    .max(100, "Business name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-&'.]+$/, "Business name can only contain letters, numbers, spaces, and basic punctuation"),

  sector: z.string()
    .min(1, "Please select a business sector")
    .refine((val) => Object.keys(sectors).includes(val), "Invalid sector selected"),

  industry: z.string()
    .min(1, "Please select an industry")
    .refine((val) => {
      const sector = sectors[selectedSector as keyof typeof sectors];
      return sector?.subsectors && Object.keys(sector.subsectors).includes(val);
    }, "Invalid industry for selected sector"),

  stage: z.string()
    .min(1, "Please select a business stage")
    .refine((val) => Object.keys(businessStages).includes(val), "Invalid business stage selected"),

  intellectualProperty: z.string()
    .optional()
    .refine((val) => !val || ['none', 'pending', 'registered'].includes(val), "Invalid IP status"),

  teamExperience: z.number()
    .min(0, "Team experience cannot be negative")
    .max(50, "Team experience seems unusually high")
    .optional()
    .transform(val => val === undefined ? 0 : val),

  customerBase: z.number()
    .min(0, "Customer base cannot be negative")
    .optional()
    .transform(val => val === undefined ? 0 : val),

  competitiveDifferentiation: z.string()
    .optional()
    .refine((val) => !val || ['low', 'medium', 'high'].includes(val), "Invalid competitive differentiation level"),

  regulatoryCompliance: z.string()
    .optional(),

  scalability: z.string()
    .optional()
    .refine((val) => !val || ['limited', 'moderate', 'high'].includes(val), "Invalid scalability level"),
});

// Validation rules for ValidationEngine
const validationRules = {
  businessName: { minLength: 1, maxLength: 100 },
  teamExperience: { min: 0, max: 50 },
  customerBase: { min: 0, max: 1000000 }
};

interface BusinessInfoStepProps {
  data: Partial<ValuationFormData>;
  onUpdate: (data: Partial<ValuationFormData>) => Promise<void>;
  onNext: () => void;
  currentStep: number;
  totalSteps: number;
}

export function BusinessInfoStep({ data, onUpdate, onNext, currentStep, totalSteps }: BusinessInfoStepProps) {
  const [selectedSector, setSelectedSector] = useState<string>(data.sector || "");
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { callApiWithRetry } = useApiWithRetry();

  // Create form with dynamic schema based on selected sector
  const form = useForm<ValuationFormData>({
    resolver: zodResolver(createFormSchema(selectedSector)),
    mode: "onChange",
    defaultValues: {
      businessName: data.businessName || "",
      sector: data.sector || "",
      industry: data.industry || "",
      stage: data.stage || "",
      intellectualProperty: data.intellectualProperty || "none",
      teamExperience: data.teamExperience || 0,
      customerBase: data.customerBase || 0,
      competitiveDifferentiation: data.competitiveDifferentiation || "medium",
      regulatoryCompliance: data.regulatoryCompliance || "",
      scalability: data.scalability || "moderate"
    }
  });

  // Track form errors for better error message display
  const formErrors = form.formState.errors;
  const hasErrors = Object.keys(formErrors).length > 0;

  const handleSectorChange = (value: string) => {
    const prevState = form.getValues();
    setSelectedSector(value);
    form.setValue("sector", value, { shouldValidate: true });
    // Reset industry when sector changes
    form.setValue("industry", "", { shouldValidate: true });

    // Track state changes
    DebugHelper.trackStateChange(prevState, {
      ...prevState,
      sector: value,
      industry: ""
    });
  };

  const validateField = (name: string, value: any) => {
    if (name in validationRules) {
      const rules = validationRules[name as keyof typeof validationRules];
      if (typeof value === 'number') {
        return ValidationEngine.validateNumber(value, rules);
      }
      if (typeof value === 'string') {
        return ValidationEngine.validateString(value, rules);
      }
    }
    return true;
  };

  const handleSubmit = async (values: ValuationFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Additional validation using ValidationEngine
      const validationErrors: string[] = [];
      Object.entries(values).forEach(([field, value]) => {
        if (!validateField(field, value)) {
          validationErrors.push(`Invalid value for ${field}`);
        }
      });

      if (validationErrors.length > 0) {
        const error = ErrorHandler.handleValidationError({
          message: validationErrors.join(', '),
          suggestions: ['Check the input values', 'Ensure all required fields are filled']
        });
        error.toast();
        return;
      }

      // Track API call with DebugHelper
      const result = await DebugHelper.trackAPICall(
        async () => await callApiWithRetry(
          () => onUpdate(values),
          { maxRetries: 3, baseDelay: 1000 }
        ),
        'Update Business Info'
      );

      if (result !== null) {
        onNext();
      } else {
        toast({
          title: "Error",
          description: "Failed to save business information after multiple attempts. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        ErrorHandler.logError(error, {
          context: 'BusinessInfoStep.handleSubmit',
          formData: values
        });
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Error summary component
  const ErrorSummary = () => {
    if (!hasErrors) return null;

    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Validation Errors</AlertTitle>
        <AlertDescription>
          <ul className="list-disc pl-4 mt-2">
            {Object.entries(formErrors).map(([field, error]) => (
              <li key={field} className="text-sm">
                {error.message}
              </li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    );
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  // Helper components
  const FieldTooltip = ({ content }: { content: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 ml-1 inline-block text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round(progressPercentage)}% Complete</span>
        </div>
        <Progress value={progressPercentage} className="w-full" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Enter your business details to begin the valuation process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorSummary />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <FormLabel>Business Name *</FormLabel>
                        <FieldTooltip content="Enter your company's legal or trading name" />
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., TechStart Solutions"
                          className="max-w-md"
                          aria-required="true"
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
                        <div className="flex items-center">
                          <FormLabel>Business Sector *</FormLabel>
                          <FieldTooltip content="Choose the primary sector your business operates in" />
                        </div>
                        <Select
                          value={field.value}
                          onValueChange={handleSectorChange}
                        >
                          <SelectTrigger aria-required="true">
                            <SelectValue placeholder="Select your sector" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(sectors).map(([key, { name }]) => (
                              <SelectItem key={key} value={key}>{name}</SelectItem>
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
                        <div className="flex items-center">
                          <FormLabel>Industry *</FormLabel>
                          <FieldTooltip content="Select your specific industry within the chosen sector" />
                        </div>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            form.setValue("industry", value, { shouldValidate: true });
                          }}
                          disabled={!selectedSector}
                        >
                          <SelectTrigger aria-required="true">
                            <SelectValue placeholder={selectedSector ? "Select your industry" : "Select sector first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedSector && sectors[selectedSector]?.subsectors &&
                              Object.entries(sectors[selectedSector].subsectors).map(([key, name]) => (
                                <SelectItem key={key} value={key}>{name}</SelectItem>
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
                      <div className="flex items-center">
                        <FormLabel>Business Stage *</FormLabel>
                        <FieldTooltip content="Indicate the current stage of your business development" />
                      </div>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          form.setValue("stage", value, { shouldValidate: true });
                        }}
                      >
                        <SelectTrigger aria-required="true">
                          <SelectValue placeholder="Select your stage" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(businessStages).map(([key, name]) => (
                            <SelectItem key={key} value={key}>{name}</SelectItem>
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
                        <div className="flex items-center">
                          <FormLabel>IP Protection Status</FormLabel>
                          <FieldTooltip content="Specify the status of your intellectual property protection" />
                        </div>
                        <Select
                          value={field.value}
                          onValueChange={(value) => form.setValue("intellectualProperty", value)}
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
                        <div className="flex items-center">
                          <FormLabel>Competitive Differentiation</FormLabel>
                          <FieldTooltip content="Assess your business's competitive advantage in the market" />
                        </div>
                        <Select
                          value={field.value}
                          onValueChange={(value) => form.setValue("competitiveDifferentiation", value)}
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
                      <div className="flex items-center">
                        <FormLabel>Business Scalability</FormLabel>
                        <FieldTooltip content="Evaluate your business's potential for growth and expansion" />
                      </div>
                      <Select
                        value={field.value}
                        onValueChange={(value) => form.setValue("scalability", value)}
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
                    name="teamExperience"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel>Team Experience (years)</FormLabel>
                          <FieldTooltip content="Average relevant industry experience of your team" />
                        </div>
                        <FormDescription>Average relevant industry experience</FormDescription>
                        <div className="pt-2">
                          <Slider
                            value={[field.value || 0]}
                            onValueChange={([value]) => form.setValue("teamExperience", value)}
                            max={20}
                            step={1}
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
                        <div className="flex items-center">
                          <FormLabel>Current Customer Base</FormLabel>
                          <FieldTooltip content="Number of active customers or users your business has" />
                        </div>
                        <FormDescription>Number of active customers/users</FormDescription>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => form.setValue("customerBase", Number(e.target.value))}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      form.reset();
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || hasErrors}
                    aria-busy={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Continue"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {form.formState.isValidating && (
        <div className="text-sm text-muted-foreground">
          Validating...
        </div>
      )}
    </div>
  );
}