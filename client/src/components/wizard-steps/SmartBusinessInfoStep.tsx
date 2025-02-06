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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Info, AlertCircle } from "lucide-react";

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
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
  const [validationStatus, setValidationStatus] = useState<{
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }>({ errors: [], warnings: [], suggestions: [] });

  const form = useForm<BusinessInformation>({
    resolver: zodResolver(businessInformationSchema),
    defaultValues: {
      industrySegment: initialData?.industrySegment || "",
      sector: initialData?.sector || "",
      name: initialData?.name || "",
      businessModel: initialData?.businessModel || "b2b",
      location: initialData?.location || "",
      teamSize: initialData?.teamSize || 1,
      description: initialData?.description || ""
    },
  });

  // Handle industry change to update available sectors
  const handleIndustryChange = (industry: string) => {
    const sectors = BusinessInformationHandler.getAvailableSectors(industry);
    setAvailableSectors(sectors);

    // Clear sector if current selection is invalid for new industry
    const currentSector = form.getValues("sector");
    if (!sectors.includes(currentSector)) {
      form.setValue("sector", sectors[0] || "");
    }
  };

  // Watch for industry changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "industrySegment" && value.industrySegment) {
        handleIndustryChange(value.industrySegment);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

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
        description: error instanceof Error ? error.message : "Failed to save business information",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round(progressPercentage)}% Complete</span>
        </div>
        <Progress value={progressPercentage} className="w-full" />
      </div>

      {/* Validation Feedback */}
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

      {validationStatus.suggestions.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Suggestions</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4 mt-2">
              {validationStatus.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm">{suggestion}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Start by selecting your industry and business opportunity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Industry & Sector Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Industry Classification</h3>

                {/* Industry Segment */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">
                      Industry Segment *
                    </label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Select your primary industry segment to see relevant business opportunities
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select
                    onValueChange={(value) => {
                      form.setValue("industrySegment", value);
                      handleIndustryChange(value);
                    }}
                    defaultValue={form.getValues("industrySegment")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(BusinessInformationHandler.industrySegments).map(([industry, segments]) => (
                        segments.map((segment) => (
                          <SelectItem key={segment} value={segment}>
                            {segment}
                          </SelectItem>
                        ))
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Business Sector */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">
                      Business Sector *
                    </label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Choose your business opportunity type within the selected industry
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select
                    onValueChange={(value) => form.setValue("sector", value)}
                    defaultValue={form.getValues("sector")}
                    disabled={!form.getValues("industrySegment")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSectors.map((sector) => (
                        <SelectItem key={sector} value={sector}>
                          {sector.charAt(0).toUpperCase() + sector.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>

                {/* Business Name */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">
                      Business Name *
                    </label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Enter your company's registered or trading name
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    {...form.register("name")}
                    placeholder="Enter your business name"
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">
                      Location *
                    </label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Primary location of your business operations
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    {...form.register("location")}
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>

                {/* Team Size */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">
                      Team Size *
                    </label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Number of full-time team members
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    {...form.register("teamSize", { valueAsNumber: true })}
                    type="number"
                    min={1}
                    placeholder="Enter team size"
                  />
                </div>
              </div>

              {/* Business Model & Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Business Model & Description</h3>

                {/* Business Model */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">
                      Business Model *
                    </label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        How your business generates revenue
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select
                    onValueChange={(value) => form.setValue("businessModel", value)}
                    defaultValue={form.getValues("businessModel")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="b2b">Business to Business (B2B)</SelectItem>
                      <SelectItem value="b2c">Business to Consumer (B2C)</SelectItem>
                      <SelectItem value="b2b2c">Business to Business to Consumer (B2B2C)</SelectItem>
                      <SelectItem value="c2c">Consumer to Consumer (C2C)</SelectItem>
                      <SelectItem value="subscription">Subscription</SelectItem>
                      <SelectItem value="transactional">Transactional</SelectItem>
                      <SelectItem value="advertising">Advertising</SelectItem>
                      <SelectItem value="licensing">Licensing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">
                      Business Description *
                    </label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Provide a detailed description of your business (minimum 50 characters)
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Textarea
                    {...form.register("description")}
                    placeholder="Describe your business, its mission, and unique value proposition..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-between items-center pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={isSubmitting}
                >
                  Reset
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
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