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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { businessInformationSchema, type BusinessInformation } from "@/lib/types/startup-business";
import { useToast } from "@/hooks/use-toast";
import { BusinessInformationHandler, industrySegments } from "@/lib/handlers/business-information-handler";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

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

  const form = useForm<BusinessInformation>({
    resolver: zodResolver(businessInformationSchema),
    defaultValues: {
      name: initialData?.name || "",
      sector: initialData?.sector || undefined,
      industrySegment: initialData?.industrySegment || "",
      businessModel: initialData?.businessModel || undefined,
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
      const sectors = await BusinessInformationHandler.getAvailableSectors(industry);
      setAvailableSectors(sectors);
    } catch (error) {
      console.error("Error loading sectors:", error);
      toast({
        title: "Error",
        description: "Failed to load sectors",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "industrySegment") {
        handleIndustryChange(value.industrySegment as string);
      }

      // Update form progress
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
      await onSubmit(data);
      toast({
        title: "Success",
        description: "Business information saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("max-w-6xl mx-auto p-6", className)}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
          <CardDescription>Tell us about your business</CardDescription>
          <Progress value={formProgress} className="h-2 mt-4" />
          <p className="text-sm text-muted-foreground mt-2">
            {formProgress.toFixed(0)}% complete
          </p>
        </CardHeader>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="h-10"
                          placeholder="Enter your business name" 
                        />
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
                      <FormLabel>Industry</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select your industry" />
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
              </CardContent>
            </Card>

            {/* Business Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Business Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="sector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sector</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!form.getValues("industrySegment")}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select your sector" />
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
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select your model" />
                          </SelectTrigger>
                        </FormControl>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Team Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team Information</CardTitle>
              </CardHeader>
              <CardContent>
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
                          className="h-10"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormDescription>
                        Number of full-time team members
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Description Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Business Description</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe your business, mission, and unique value proposition..."
                          className="min-h-[120px] resize-y"
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum 50 characters required
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isLoading}
              className="min-w-[120px]"
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !form.formState.isValid}
              className="min-w-[120px]"
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default BusinessInformationForm;