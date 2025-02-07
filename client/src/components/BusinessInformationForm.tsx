import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { businessInformationSchema, type BusinessInformation } from "@/lib/types/startup-business";
import { useToast } from "@/hooks/use-toast";
import { BusinessInformationHandler, industrySegments } from "@/lib/handlers/business-information-handler";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface BusinessInformationFormProps {
  initialData?: Partial<BusinessInformation>;
  onSubmit: (data: BusinessInformation) => void;
  className?: string;
}

export function BusinessInformationForm({
  initialData,
  onSubmit,
  className
}: BusinessInformationFormProps) {
  const { toast } = useToast();
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
  const [formProgress, setFormProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with real-time validation
  const form = useForm<BusinessInformation>({
    resolver: zodResolver(businessInformationSchema),
    defaultValues: {
      name: initialData?.name || "",
      sector: initialData?.sector || undefined,
      industrySegment: initialData?.industrySegment || "",
      businessModel: initialData?.businessModel || "saas",
      stage: initialData?.stage || "ideation_validated",
      teamSize: initialData?.teamSize || 1,
      description: initialData?.description || "",
      foundingDate: initialData?.foundingDate,
      location: initialData?.location || "",
      productStage: initialData?.productStage || "concept",
      businessMaturity: initialData?.businessMaturity || {
        monthsOperating: 0,
        revenueStatus: "pre_revenue",
        customerBase: 0,
        marketValidation: "none"
      },
      regulatoryStatus: initialData?.regulatoryStatus || {
        compliance: "notRequired",
        licenses: [],
        certifications: []
      }
    },
    mode: "onChange"
  });

  // Update available sectors when industry changes
  const handleIndustryChange = useCallback(async (industry: string) => {
    try {
      setIsLoading(true);
      const sectors = await BusinessInformationHandler.getAvailableSectors(industry);
      setAvailableSectors(sectors);

      // Reset sector if current selection is invalid
      const currentSector = form.getValues("sector");
      if (currentSector && !sectors.includes(currentSector)) {
        form.setValue("sector", undefined, { shouldValidate: true });
      }
    } catch (error) {
      console.error("Error loading sectors:", error);
      toast({
        title: "Error",
        description: "Failed to load available sectors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [form, toast]);

  // Watch form changes and update progress
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "industrySegment") {
        handleIndustryChange(value.industrySegment as string);
      }

      // Calculate form progress
      const filledFields = Object.entries(value).filter(([_, v]) => 
        v !== "" && v !== undefined && v !== null
      ).length;
      const totalFields = Object.keys(form.getValues()).length;
      setFormProgress((filledFields / totalFields) * 100);
    });

    return () => subscription.unsubscribe();
  }, [form, handleIndustryChange]);

  const handleFormSubmit = async (data: BusinessInformation) => {
    try {
      setIsLoading(true);
      const validationResult = await BusinessInformationHandler.validateBusinessInformation(data);

      if (!validationResult.isValid) {
        validationResult.errors.forEach(error => {
          toast({
            title: "Validation Error",
            description: error,
            variant: "destructive",
          });
        });
        return;
      }

      await onSubmit(data);
      toast({
        title: "Success",
        description: "Business information saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save business information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn("p-6", className)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Progress Header */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Business Profile</h3>
            <Progress value={formProgress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {formProgress.toFixed(0)}% complete
            </p>
          </div>

          {/* Business Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Business Name
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Enter your company's legal or registered business name
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., TechStart Solutions Inc."
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>
                  Your company's official name
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Industry Segment */}
          <FormField
            control={form.control}
            name="industrySegment"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Industry Segment
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Select your primary industry segment
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  {isLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your industry segment" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(industrySegments).map(([_, segments]) =>
                          segments.map((segment) => (
                            <SelectItem key={segment} value={segment}>
                              {segment}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </FormControl>
                <FormDescription>
                  Select your primary industry
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Business Sector */}
          <FormField
            control={form.control}
            name="sector"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Business Sector
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Select the type of business opportunity
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  {isLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading || !form.getValues("industrySegment")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your business sector" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSectors.map((sector) => (
                          <SelectItem key={sector} value={sector}>
                            {sector.charAt(0).toUpperCase() + sector.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </FormControl>
                <FormDescription>
                  Choose your business sector
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Business Model */}
          <FormField
            control={form.control}
            name="businessModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Business Model
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Select your primary revenue generation model
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your business model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saas">Software as a Service (SaaS)</SelectItem>
                      <SelectItem value="marketplace">Marketplace</SelectItem>
                      <SelectItem value="subscription">Subscription</SelectItem>
                      <SelectItem value="advertising">Advertising</SelectItem>
                      <SelectItem value="hardware">Hardware</SelectItem>
                      <SelectItem value="licensing">Licensing</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="data_monetization">Data Monetization</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  Select your revenue model
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Team Size */}
          <FormField
            control={form.control}
            name="teamSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Team Size
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Enter the total number of team members
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="e.g., 5"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value) || 1)}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>
                  Include all full-time team members
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Business Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Business Description
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Provide a detailed description of your business
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your business, its mission, and unique value proposition..."
                    className="min-h-[120px] resize-y"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>
                  Minimum 50 characters required
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              className="w-32"
              disabled={isLoading}
            >
              Reset
            </Button>
            <Button 
              type="submit" 
              className="w-32"
              disabled={isLoading || !form.formState.isValid}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}

export default BusinessInformationForm;