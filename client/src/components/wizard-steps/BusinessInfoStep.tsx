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
import { sectors, industries, productStages, revenueModels, businessStages } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DebugHelper from "@/lib/debug-helper";
import type { ValuationFormData } from "@/lib/validations";

// Create a type-safe schema for this step
const businessInfoSchema = z.object({
  businessName: z.string()
    .min(1, "Business name is required")
    .max(100, "Business name must be less than 100 characters"),
  sector: z.string().min(1, "Sector is required"),
  industry: z.string().min(1, "Industry is required"),
  stage: z.enum(Object.keys(businessStages) as [keyof typeof businessStages, ...Array<keyof typeof businessStages>]),
  employeeCount: z.number().min(1, "Must have at least 1 employee"),
  teamExperience: z.number().min(0).max(50).optional(),
  customerBase: z.number().min(0).optional(),
  revenueModel: z.enum(Object.keys(revenueModels) as [keyof typeof revenueModels, ...Array<keyof typeof revenueModels>]),
  productStage: z.enum(Object.keys(productStages) as [keyof typeof productStages, ...Array<keyof typeof productStages>]),
  scalability: z.enum(["limited", "moderate", "high"] as const),
  intellectualProperty: z.enum(["none", "pending", "registered"] as const),
  regulatoryCompliance: z.enum(["notRequired", "inProgress", "compliant"] as const),
});

type BusinessInfoFormData = z.infer<typeof businessInfoSchema>;

interface BusinessInfoStepProps {
  data: Partial<BusinessInfoFormData>;
  onUpdate: (data: BusinessInfoFormData) => Promise<void>;
  onNext: () => void;
  currentStep: number;
  totalSteps: number;
}

export function BusinessInfoStep({ data, onUpdate, onNext, currentStep, totalSteps }: BusinessInfoStepProps) {
  const [selectedSector, setSelectedSector] = useState<string>(data.sector || Object.keys(sectors)[0]);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { callApiWithRetry } = useApiWithRetry();

  const form = useForm<BusinessInfoFormData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      businessName: data.businessName || "",
      sector: data.sector || Object.keys(sectors)[0],
      industry: data.industry || "",
      stage: data.stage || Object.keys(businessStages)[0],
      employeeCount: data.employeeCount || 1,
      teamExperience: data.teamExperience || 0,
      customerBase: data.customerBase || 0,
      revenueModel: data.revenueModel || Object.keys(revenueModels)[0],
      productStage: data.productStage || Object.keys(productStages)[0],
      scalability: data.scalability || "moderate",
      intellectualProperty: data.intellectualProperty || "none",
      regulatoryCompliance: data.regulatoryCompliance || "notRequired",
    },
    mode: "onChange"
  });

  const formErrors = form.formState.errors;
  const hasErrors = Object.keys(formErrors).length > 0;

  const handleSectorChange = (value: string) => {
    setSelectedSector(value);
    form.setValue("sector", value, { shouldValidate: true });
    // Industry selection is now handled by the schema, no need for manual update here.
    DebugHelper.trackStateChange(form.getValues(), {...form.getValues(), sector: value, industry: ""});
  };

  const handleSubmit = async (values: BusinessInfoFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
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
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>

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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Market Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Market Information</h3>

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
                              {Object.entries(sectors).map(([key, name]) => (
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
                            onValueChange={(value) => form.setValue("industry", value)}
                          >
                            <SelectTrigger aria-required="true">
                              <SelectValue placeholder="Select your industry" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(industries).map(([key, name]) => (
                                <SelectItem key={key} value={key}>{name}</SelectItem>
                              ))}
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
                          <FieldTooltip content="Choose the stage of your business" />
                        </div>
                        <Select
                          value={field.value}
                          onValueChange={value => form.setValue('stage', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select business stage" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(businessStages).map(([key, value]) => (
                              <SelectItem key={key} value={key}>{value}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Business Model Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Business Model</h3>

                  <FormField
                    control={form.control}
                    name="revenueModel"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel>Revenue Model *</FormLabel>
                          <FieldTooltip content="How does your business generate revenue?" />
                        </div>
                        <Select
                          value={field.value}
                          onValueChange={(value) => form.setValue("revenueModel", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select revenue model" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(revenueModels).map(([key, name]) => (
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
                    name="productStage"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel>Product Stage *</FormLabel>
                          <FieldTooltip content="Current stage of your product development" />
                        </div>
                        <Select
                          value={field.value}
                          onValueChange={(value) => form.setValue("productStage", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product stage" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(productStages).map(([key, name]) => (
                              <SelectItem key={key} value={key}>{name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Team and Operations Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Team and Operations</h3>

                  <FormField
                    control={form.control}
                    name="employeeCount"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel>Number of Employees *</FormLabel>
                          <FieldTooltip content="Total number of full-time employees" />
                        </div>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => form.setValue("employeeCount", parseInt(e.target.value, 10))}
                            min={1}
                            className="max-w-md"
                          />
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
                </div>

                {/* Additional Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Additional Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="scalability"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center">
                            <FormLabel>Business Scalability</FormLabel>
                            <FieldTooltip content="Evaluate your business's potential for growth and expansion" />
                          </div>
                          <FormDescription>
                            Assess your business's ability to grow and handle increased demand
                          </FormDescription>
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

                    <FormField
                      control={form.control}
                      name="customerBase"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center">
                            <FormLabel>Current Customer Base</FormLabel>
                            <FieldTooltip content="Number of active customers or users your business has" />
                          </div>
                          <FormDescription>
                            Include both paying and active free users
                          </FormDescription>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => form.setValue("customerBase", Number(e.target.value))}
                              className="max-w-md"
                              placeholder="e.g., 1000"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="regulatoryCompliance"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center">
                            <FormLabel>Regulatory Compliance</FormLabel>
                            <FieldTooltip content="Your business's current regulatory compliance status" />
                          </div>
                          <FormDescription>
                            Indicate your compliance with industry regulations
                          </FormDescription>
                          <Select
                            value={field.value}
                            onValueChange={(value) => form.setValue("regulatoryCompliance", value)}
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
                      name="intellectualProperty"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center">
                            <FormLabel>IP Protection Status</FormLabel>
                            <FieldTooltip content="Current status of your intellectual property protection" />
                          </div>
                          <FormDescription>
                            Include patents, trademarks, and trade secrets
                          </FormDescription>
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
                  </div>
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