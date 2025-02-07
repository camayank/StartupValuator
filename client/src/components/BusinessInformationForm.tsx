import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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

  const form = useForm<BusinessInformation>({
    resolver: zodResolver(businessInformationSchema),
    defaultValues: {
      name: initialData?.name || "",
      sector: initialData?.sector || "technology",
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
    }
  });

  // Update available sectors when industry changes
  const handleIndustryChange = useCallback((industry: string) => {
    const sectors = BusinessInformationHandler.getAvailableSectors(industry);
    setAvailableSectors(sectors);

    // Clear sector if current selection is invalid for new industry
    const currentSector = form.getValues("sector");
    if (currentSector && !sectors.includes(currentSector)) {
      form.setValue("sector", "technology");
    }
  }, [form]);

  // Watch for industry changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "industrySegment") {
        handleIndustryChange(value.industrySegment as string);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, handleIndustryChange]);

  const handleFormSubmit = async (data: BusinessInformation) => {
    try {
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

      if (validationResult.warnings?.length > 0) {
        validationResult.warnings.forEach(warning => {
          toast({
            title: "Warning",
            description: warning,
          });
        });
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
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className={cn("space-y-6", className)}>
        {/* Business Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Business Name *
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Enter your company's legal or registered business name
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., TechStart Solutions Inc." />
              </FormControl>
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
                Industry Segment *
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Select your primary industry segment
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry segment" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(industrySegments).map(([industry, segments]) => (
                      segments.map((segment) => (
                        <SelectItem key={segment} value={segment}>
                          {segment}
                        </SelectItem>
                      ))
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
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
                Business Sector *
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Select the type of business opportunity in your industry
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!form.getValues("industrySegment")}
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
              </FormControl>
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
                Business Model *
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Select your primary business model
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
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
                  </SelectContent>
                </Select>
              </FormControl>
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
                Team Size *
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Enter the total number of full-time team members
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
                />
              </FormControl>
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
                Business Description *
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Provide a detailed description of your business (minimum 50 characters)
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your business, its mission, and unique value proposition..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button
            variant="outline"
            type="button"
            onClick={() => form.reset()}
          >
            Reset
          </Button>
          <Button type="submit">
            Save Information
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default BusinessInformationForm;