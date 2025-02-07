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
import { Card } from "@/components/ui/card";
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
  const [isLoading, setIsLoading] = useState(false);

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

  const handleIndustryChange = useCallback(async (industry: string) => {
    try {
      setIsLoading(true);
      const sectors = await BusinessInformationHandler.getAvailableSectors(industry);
      setAvailableSectors(sectors);
      const currentSector = form.getValues("sector");
      if (currentSector && !sectors.includes(currentSector)) {
        form.setValue("sector", undefined, { shouldValidate: true });
      }
    } catch (error) {
      console.error("Error loading sectors:", error);
      toast({
        title: "Error",
        description: "Failed to load sectors",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [form, toast]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "industrySegment") {
        handleIndustryChange(value.industrySegment as string);
      }
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
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter business name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industrySegment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry Segment</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Sector</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!form.getValues("industrySegment")}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sector" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableSectors.map((sector) => (
                          <SelectItem key={sector} value={sector}>
                            {sector}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="businessModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Model</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="saas">SaaS</SelectItem>
                        <SelectItem value="marketplace">Marketplace</SelectItem>
                        <SelectItem value="subscription">Subscription</SelectItem>
                        <SelectItem value="advertising">Advertising</SelectItem>
                        <SelectItem value="hardware">Hardware</SelectItem>
                        <SelectItem value="licensing">Licensing</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teamSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Size</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe your business..."
                        className="h-24"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isLoading}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={!form.formState.isValid || isLoading}
              >
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </Card>
  );
}

export default BusinessInformationForm;