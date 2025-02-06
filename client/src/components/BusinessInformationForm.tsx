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
      industrySegment: initialData?.industrySegment || "",
      sector: initialData?.sector || "",
      name: initialData?.name || "",
      businessModel: initialData?.businessModel || "b2b",
      location: initialData?.location || "",
      teamSize: initialData?.teamSize || 1,
      description: initialData?.description || "",
      stage: initialData?.stage || "ideation"
    }
  });

  // Update available sectors when industry changes
  const handleIndustryChange = useCallback((industry: string) => {
    const sectors = BusinessInformationHandler.getAvailableSectors(industry);
    setAvailableSectors(sectors);

    // Clear sector if current selection is invalid for new industry
    const currentSector = form.getValues("sector");
    if (!sectors.includes(currentSector)) {
      form.setValue("sector", sectors[0] || "");
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

  const handleSubmit = async (data: BusinessInformation) => {
    try {
      const validation = BusinessInformationHandler.validateBusinessInformation(data);

      if (!validation.isValid) {
        validation.errors.forEach(error => {
          toast({
            title: "Validation Error",
            description: error,
            variant: "destructive",
          });
        });
        return;
      }

      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => {
          toast({
            title: "Warning",
            description: warning,
            variant: "warning",
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className={cn("space-y-6", className)}>
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
                Select your primary industry segment
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
              {Object.entries(industrySegments).map(([industry, segments]) => (
                segments.map((segment) => (
                  <SelectItem key={segment} value={segment}>
                    {segment}
                  </SelectItem>
                ))
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.industrySegment && (
            <p className="text-sm text-destructive">{form.formState.errors.industrySegment.message}</p>
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
                Select the type of business opportunity in your industry
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            onValueChange={(value) => form.setValue("sector", value)}
            defaultValue={form.getValues("sector")}
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
          {form.formState.errors.sector && (
            <p className="text-sm text-destructive">{form.formState.errors.sector.message}</p>
          )}
        </div>

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
                Select your primary business model
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

        {/* Business Description */}
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