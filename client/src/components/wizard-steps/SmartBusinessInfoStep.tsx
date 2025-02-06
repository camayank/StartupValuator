import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  businessInformationSchema,
  type BusinessInformation,
} from "@/lib/types/startup-business";
import { BusinessInformationHandler } from "@/lib/handlers/business-information-handler";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Info, AlertCircle } from "lucide-react";
import { sectors, industries } from "@/lib/validations";

interface SmartBusinessInfoStepProps {
  initialData?: Partial<BusinessInformation>;
  onUpdate: (data: BusinessInformation) => Promise<void>;
  onNext: () => void;
  currentStep: number;
  totalSteps: number;
}

export function SmartBusinessInfoStep({
  initialData,
  onUpdate,
  onNext,
  currentStep,
  totalSteps,
}: SmartBusinessInfoStepProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }>({ errors: [], warnings: [], suggestions: [] });

  const form = useForm<BusinessInformation>({
    resolver: zodResolver(businessInformationSchema),
    defaultValues: {
      name: initialData?.name || "",
      sector: initialData?.sector || "technology",
      industrySegment: initialData?.industrySegment || "",
      businessModel: initialData?.businessModel || "saas",
      stage: initialData?.stage || "ideation_unvalidated",
      teamSize: initialData?.teamSize || 1,
      location: initialData?.location || "",
      description: initialData?.description || "",
      productStage: initialData?.productStage || "concept",
      businessMaturity: {
        monthsOperating: 0,
        revenueStatus: "pre_revenue",
        customerBase: 0,
        marketValidation: "none",
      },
      regulatoryStatus: {
        compliance: "notRequired",
        licenses: [],
        certifications: [],
      },
    },
  });

  // Watch for sector changes to update recommendations
  const selectedSector = form.watch("sector");
  const selectedStage = form.watch("stage");

  useEffect(() => {
    if (selectedSector) {
      const recommendations = BusinessInformationHandler.getSectorRecommendations(
        selectedSector as keyof typeof sectors
      );
      if (recommendations) {
        setValidationStatus(prev => ({
          ...prev,
          suggestions: [
            `Recommended team size: ${recommendations.recommendedTeamSize}`,
            `Key certifications to consider: ${recommendations.certifications.join(", ")}`,
            `Key risk factors: ${recommendations.keyRiskFactors.join(", ")}`
          ]
        }));
      }
    }
  }, [selectedSector]);

  // Handle form submission
  const onSubmit = async (data: BusinessInformation) => {
    setIsSubmitting(true);
    try {
      const validation = BusinessInformationHandler.validateBusinessInformation(data);
      setValidationStatus(validation);

      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: "Please address the highlighted issues before proceeding.",
          variant: "destructive",
        });
        return;
      }

      await onUpdate(data);
      
      if (validation.warnings.length > 0) {
        // Show warnings but allow proceeding
        toast({
          title: "Recommendations Available",
          description: "Review suggestions to optimize your business profile.",
          variant: "warning",
        });
      }

      onNext();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save business information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round(progressPercentage)}% Complete</span>
        </div>
        <Progress value={progressPercentage} className="w-full" />
      </div>

      {validationStatus.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Errors</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4 mt-2">
              {validationStatus.errors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {validationStatus.warnings.length > 0 && (
        <Alert variant="warning">
          <Info className="h-4 w-4" />
          <AlertTitle>Recommendations</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4 mt-2">
              {validationStatus.warnings.map((warning, index) => (
                <li key={index} className="text-sm">{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Tell us about your business to begin the valuation process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                {/* Business Name */}
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Business Name *
                    </label>
                    <Input
                      {...form.register("name")}
                      id="name"
                      placeholder="Enter your business name"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Sector Selection */}
                  <div className="space-y-2">
                    <label htmlFor="sector" className="text-sm font-medium">
                      Business Sector *
                    </label>
                    <Select
                      onValueChange={(value) =>
                        form.setValue("sector", value as keyof typeof sectors)
                      }
                      defaultValue={form.getValues("sector")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your sector" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(sectors).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Industry Segment */}
                  <div className="space-y-2">
                    <label htmlFor="industrySegment" className="text-sm font-medium">
                      Industry Segment *
                    </label>
                    <Input
                      {...form.register("industrySegment")}
                      id="industrySegment"
                      placeholder="Enter your industry segment"
                    />
                  </div>
                </div>
              </div>

              {/* Business Model and Stage */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Business Model & Stage</h3>
                
                {/* Business Model Selection */}
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label htmlFor="businessModel" className="text-sm font-medium">
                      Business Model *
                    </label>
                    <Select
                      onValueChange={(value) => form.setValue("businessModel", value)}
                      defaultValue={form.getValues("businessModel")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your business model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marketplace">Marketplace</SelectItem>
                        <SelectItem value="saas">SaaS</SelectItem>
                        <SelectItem value="subscription">Subscription</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="advertising">Advertising</SelectItem>
                        <SelectItem value="licensing">Licensing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => form.reset()}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || Object.keys(form.formState.errors).length > 0}
                >
                  {isSubmitting ? "Saving..." : "Continue"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SmartBusinessInfoStep;
