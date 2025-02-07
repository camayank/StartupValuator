import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { sectors, industries, businessStages, revenueModels, productStages, businessInfoSchema } from "@/lib/validations";
import type { BusinessInfoFormData } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";

interface BusinessInfoStepProps {
  data?: Partial<BusinessInfoFormData>;
  onUpdate: (data: BusinessInfoFormData) => Promise<void>;
  onNext: () => void;
  currentStep: number;
  totalSteps: number;
}

export function BusinessInfoStep({
  data = {},
  onUpdate,
  onNext,
  currentStep,
  totalSteps
}: BusinessInfoStepProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSector, setSelectedSector] = useState<string>(data.sector || "");
  const [availableIndustries, setAvailableIndustries] = useState<Record<string, any>>({});

  const form = useForm<BusinessInfoFormData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      businessName: data.businessName || "",
      sector: data.sector || "",
      industry: data.industry || "",
      stage: data.stage || "ideation_unvalidated",
      employeeCount: data.employeeCount || 1,
      teamExperience: data.teamExperience || 0,
      customerBase: data.customerBase || 0,
      revenueModel: data.revenueModel || "subscription",
      productStage: data.productStage || "concept",
      scalability: data.scalability || "moderate",
      intellectualProperty: data.intellectualProperty || "none",
      regulatoryCompliance: data.regulatoryCompliance || "notRequired",
    }
  });

  useEffect(() => {
    if (selectedSector && sectors[selectedSector]?.subsectors) {
      setAvailableIndustries(sectors[selectedSector].subsectors);
      // Reset industry if current selection is not in new sector
      if (!sectors[selectedSector].subsectors[form.getValues().industry]) {
        form.setValue("industry", "", { shouldValidate: true });
      }
    } else {
      setAvailableIndustries({});
    }
  }, [selectedSector, form]);

  const handleSectorChange = (value: string) => {
    setSelectedSector(value);
    form.setValue("sector", value, { shouldValidate: true });
  };

  const handleSubmit = async (values: BusinessInfoFormData) => {
    try {
      setIsSubmitting(true);
      await onUpdate(values);
      toast({
        title: "Success",
        description: "Business information saved successfully.",
      });
      onNext();
    } catch (error) {
      console.error('Form submission error:', error);
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
        <div className="h-2 bg-secondary rounded-full">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Enter your business details to begin the valuation process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your business name" />
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
                      <FormLabel>Sector</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={handleSectorChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a sector" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(sectors).map(([id, sectorData]) => (
                            <SelectItem key={id} value={id}>
                              {sectorData.name}
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
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => form.setValue("industry", value)}
                        disabled={!selectedSector}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={selectedSector ? "Select an industry" : "Select sector first"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(availableIndustries).map(([id, industryData]) => (
                            <SelectItem key={id} value={id}>
                              {industryData.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Stage</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => form.setValue("stage", value as keyof typeof businessStages)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select business stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(businessStages).map(([id, name]) => (
                            <SelectItem key={id} value={id}>
                              {name}
                            </SelectItem>
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
                    name="employeeCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Employees</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                            min={1}
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
                        <FormLabel>Team Experience (Years)</FormLabel>
                        <FormControl>
                          <Slider
                            value={[field.value || 0]}
                            onValueChange={([value]) => field.onChange(value)}
                            max={50}
                            step={1}
                            className="py-4"
                          />
                        </FormControl>
                        <FormDescription>{field.value} years</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="revenueModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Revenue Model</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => form.setValue("revenueModel", value as keyof typeof revenueModels)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select revenue model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(revenueModels).map(([id, name]) => (
                            <SelectItem key={id} value={id}>
                              {name}
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
                  name="productStage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Stage</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => form.setValue("productStage", value as keyof typeof productStages)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(productStages).map(([id, name]) => (
                            <SelectItem key={id} value={id}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="scalability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scalability</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select scalability" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="limited">Limited</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="high">High</SelectItem>
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
                      <FormLabel>IP Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select IP status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="registered">Registered</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="regulatoryCompliance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compliance Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select compliance status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="notRequired">Not Required</SelectItem>
                          <SelectItem value="inProgress">In Progress</SelectItem>
                          <SelectItem value="compliant">Compliant</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6">
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