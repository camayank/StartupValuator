import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
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
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { businessInformationSchema, type BusinessInformation } from "@/lib/types/startup-business";
import { useToast } from "@/hooks/use-toast";
import { sectors, businessModels, productStages } from "@/lib/validations";
import { useCallback, useEffect } from "react";
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
  const form = useForm<BusinessInformation>({
    resolver: zodResolver(businessInformationSchema),
    defaultValues: {
      name: initialData?.name || "",
      sector: initialData?.sector || "technology",
      industrySegment: initialData?.industrySegment || "",
      businessModel: initialData?.businessModel || "saas",
      location: initialData?.location || "",
      teamSize: initialData?.teamSize || 1,
      description: initialData?.description || "",
      productStage: initialData?.productStage || "concept",
      businessMaturity: {
        monthsOperating: 0,
        revenueStatus: "pre_revenue",
        customerBase: 0,
        marketValidation: "none"
      }
    }
  });

  // Watch sector for industry segment auto-population
  const selectedSector = form.watch("sector");

  const getIndustrySegments = useCallback((sector: string) => {
    const sectorData = sectors[sector as keyof typeof sectors];
    if (!sectorData?.subsectors) return [];
    return Object.entries(sectorData.subsectors).map(([value, label]) => ({
      value,
      label: label as string
    }));
  }, []);

  // Auto-populate industry segment when sector changes
  useEffect(() => {
    if (selectedSector) {
      const segments = getIndustrySegments(selectedSector);
      if (segments.length > 0) {
        form.setValue("industrySegment", segments[0].value);
      }
    }
  }, [selectedSector, form, getIndustrySegments]);

  const handleSubmit = async (data: BusinessInformation) => {
    try {
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className={cn("space-y-6", className)}>
        {/* Business Name */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Business Name *
            </label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                Enter your company's legal or registered business name
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            {...form.register("name")}
            id="name"
            placeholder="e.g., TechStart Solutions Inc."
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>

        {/* Business Sector */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label htmlFor="sector" className="text-sm font-medium">
              Business Sector *
            </label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                Select the primary sector your business operates in
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            onValueChange={(value) => form.setValue("sector", value)}
            defaultValue={form.getValues("sector")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your sector" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(sectors).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.sector && (
            <p className="text-sm text-destructive">{form.formState.errors.sector.message}</p>
          )}
        </div>

        {/* Industry Segment */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label htmlFor="industrySegment" className="text-sm font-medium">
              Industry Segment *
            </label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                Select your specific industry segment within the chosen sector
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            onValueChange={(value) => form.setValue("industrySegment", value)}
            defaultValue={form.getValues("industrySegment")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your industry segment" />
            </SelectTrigger>
            <SelectContent>
              {getIndustrySegments(selectedSector).map((segment) => (
                <SelectItem key={segment.value} value={segment.value}>
                  {segment.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.industrySegment && (
            <p className="text-sm text-destructive">{form.formState.errors.industrySegment.message}</p>
          )}
        </div>

        {/* Business Model */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label htmlFor="businessModel" className="text-sm font-medium">
              Business Model *
            </label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                Select how your business generates revenue
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            onValueChange={(value) => form.setValue("businessModel", value)}
            defaultValue={form.getValues("businessModel")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your business model" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(businessModels).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.businessModel && (
            <p className="text-sm text-destructive">{form.formState.errors.businessModel.message}</p>
          )}
        </div>

        {/* Team Size */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label htmlFor="teamSize" className="text-sm font-medium">
              Team Size *
            </label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                Enter the total number of full-time team members
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            {...form.register("teamSize", { valueAsNumber: true })}
            id="teamSize"
            type="number"
            min={1}
            placeholder="e.g., 5"
          />
          {form.formState.errors.teamSize && (
            <p className="text-sm text-destructive">{form.formState.errors.teamSize.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label htmlFor="description" className="text-sm font-medium">
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
            id="description"
            placeholder="Describe your business, its mission, and unique value proposition..."
            className="min-h-[100px]"
          />
          {form.formState.errors.description && (
            <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
          )}
        </div>

        {/* Product Stage */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label htmlFor="productStage" className="text-sm font-medium">
              Product Stage *
            </label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                Select the current development stage of your product
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            onValueChange={(value) => form.setValue("productStage", value)}
            defaultValue={form.getValues("productStage")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your product stage" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(productStages).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.productStage && (
            <p className="text-sm text-destructive">{form.formState.errors.productStage.message}</p>
          )}
        </div>

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
