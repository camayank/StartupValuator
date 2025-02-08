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
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatCurrency, parseCurrencyInput } from "@/lib/utils";
import useForceUpdate from "@/hooks/use-force-update";

const businessInfoSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  industry: z.string().min(1, "Industry is required"),
  annualRevenue: z.number().min(0, "Revenue cannot be negative"),
  annualExpenses: z.number().min(0, "Expenses cannot be negative")
});

type BusinessInfoFormData = z.infer<typeof businessInfoSchema>;

interface BusinessInfoStepProps {
  onUpdate: (data: BusinessInfoFormData) => Promise<void>;
  onNext: () => void;
  currentStep: number;
  totalSteps: number;
}

export function BusinessInfoStep({
  onUpdate,
  onNext,
  currentStep,
  totalSteps
}: BusinessInfoStepProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use force update hook to prevent form freezing
  useForceUpdate();

  const form = useForm<BusinessInfoFormData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      businessName: "",
      industry: "",
      annualRevenue: 0,
      annualExpenses: 0
    }
  });

  // Monitor form state changes
  useEffect(() => {
    console.log('Form State Updated:', form.getValues());
  }, [form.watch()]);

  const handleSubmit = async (values: BusinessInfoFormData) => {
    try {
      setIsSubmitting(true);
      console.log('Submitting form with values:', values);

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
            Enter your core business details to begin the valuation process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="space-y-4">
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

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="saas">SaaS</SelectItem>
                          <SelectItem value="ecommerce">E-commerce</SelectItem>
                          <SelectItem value="fintech">Fintech</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="annualRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual Revenue</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              $
                            </span>
                            <Input
                              {...field}
                              type="text"
                              value={formatCurrency(field.value)}
                              onChange={(e) => {
                                const value = parseCurrencyInput(e.target.value);
                                field.onChange(value);
                                console.log('Revenue changed:', value);
                              }}
                              className="pl-8"
                              placeholder="0.00"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="annualExpenses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual Expenses</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              $
                            </span>
                            <Input
                              {...field}
                              type="text"
                              value={formatCurrency(field.value)}
                              onChange={(e) => {
                                const value = parseCurrencyInput(e.target.value);
                                field.onChange(value);
                                console.log('Expenses changed:', value);
                              }}
                              className="pl-8"
                              placeholder="0.00"
                            />
                          </div>
                        </FormControl>
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
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}