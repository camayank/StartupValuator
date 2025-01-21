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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useApiWithRetry } from "@/hooks/use-api-with-retry";
import type { ValuationFormData } from "@/lib/validations";
import { sectors, businessStages } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Enhanced validation schema with detailed messages
const formSchema = z.object({
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
      // Dynamic validation based on selected sector
      const selectedSector = sectors[formData?.sector as keyof typeof sectors];
      return selectedSector?.subsectors && Object.keys(selectedSector.subsectors).includes(val);
    }, "Invalid industry for selected sector"),

  stage: z.string()
    .min(1, "Please select a business stage")
    .refine((val) => Object.keys(businessStages).includes(val), "Invalid business stage selected"),

  // Optional fields with enhanced validation
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

interface BusinessInfoStepProps {
  data: Partial<ValuationFormData>;
  onUpdate: (data: Partial<ValuationFormData>) => Promise<void>;
  onNext: () => void;
}

export function BusinessInfoStep({ data, onUpdate, onNext }: BusinessInfoStepProps) {
  const [selectedSector, setSelectedSector] = useState<string>(data.sector || "");
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { callApiWithRetry } = useApiWithRetry();

  // Enhanced form with real-time validation
  const form = useForm<ValuationFormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange", // Enable real-time validation
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
    setSelectedSector(value);
    form.setValue("sector", value, { shouldValidate: true });
    // Reset industry when sector changes
    form.setValue("industry", "", { shouldValidate: true });
  };

  const handleSubmit = async (values: ValuationFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Attempt to update with retry mechanism
      const result = await callApiWithRetry(
        () => onUpdate(values),
        { maxRetries: 3, baseDelay: 1000 }
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

  return (
    <div className="space-y-6">
      <ErrorSummary />

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Fill in your business information below. Fields marked with * are required.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid gap-6">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., TechStart Solutions" />
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
                    <FormLabel>Business Sector *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={handleSectorChange}
                    >
                      <SelectTrigger>
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
                    <FormLabel>Industry *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        form.setValue("industry", value, { shouldValidate: true });
                      }}
                      disabled={!selectedSector}
                    >
                      <SelectTrigger>
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
                  <FormLabel>Business Stage *</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      form.setValue("stage", value, { shouldValidate: true });
                    }}
                  >
                    <SelectTrigger>
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
                    <FormLabel>IP Protection Status</FormLabel>
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
                    <FormLabel>Competitive Differentiation</FormLabel>
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
                  <FormLabel>Business Scalability</FormLabel>
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
                    <FormLabel>Team Experience (years)</FormLabel>
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
                    <FormLabel>Current Customer Base</FormLabel>
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

            <div className="flex justify-end space-x-4">
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
              >
                {isSubmitting ? "Saving..." : "Continue"}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* Real-time validation status */}
      {form.formState.isValidating && (
        <div className="text-sm text-muted-foreground">
          Validating...
        </div>
      )}
    </div>
  );
}