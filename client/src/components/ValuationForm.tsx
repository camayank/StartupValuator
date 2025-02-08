import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowRight, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { valuationFormSchema } from "@/lib/validations";
import type { ValuationFormData } from "@/lib/validations";

const formSteps = [
  {
    id: "business-info",
    title: "Business Information",
    description: "Tell us about your company",
    fields: ["businessInfo.name", "businessInfo.industry"]
  },
  {
    id: "financials",
    title: "Financial Details",
    description: "Enter your key financial metrics",
    fields: ["financialData.revenue", "financialData.growth"]
  }
];

export function ValuationForm({ onResult }: { onResult: (data: ValuationFormData) => void }) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ValuationFormData>({
    resolver: zodResolver(valuationFormSchema),
    defaultValues: {
      businessInfo: {
        name: "",
        industry: "",
      },
      financialData: {
        revenue: 0,
        growth: 0
      }
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ValuationFormData) => {
      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      return response.json();
    },
    onSuccess: (data) => {
      onResult(data);
      toast({
        title: "Success!",
        description: "Your valuation has been calculated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to calculate valuation",
        variant: "destructive",
      });
    },
  });

  async function onSubmit(data: ValuationFormData) {
    if (step < formSteps.length - 1) {
      setStep(step + 1);
      return;
    }

    setIsSubmitting(true);
    try {
      await mutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            {formSteps[step].title}
          </CardTitle>
          <CardDescription>{formSteps[step].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-4">
                    {step === 0 && (
                      <>
                        <FormField
                          control={form.control}
                          name="businessInfo.name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="h-12 text-lg transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                  placeholder="Enter your company name"
                                />
                              </FormControl>
                              <FormDescription>
                                This will help us identify your business sector
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="businessInfo.industry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Industry</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12 text-lg">
                                    <SelectValue placeholder="Select your industry" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="technology">Technology</SelectItem>
                                  <SelectItem value="healthcare">Healthcare</SelectItem>
                                  <SelectItem value="retail">Retail</SelectItem>
                                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                                  <SelectItem value="services">Services</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Choose the industry that best describes your business
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {step === 1 && (
                      <>
                        <FormField
                          control={form.control}
                          name="financialData.revenue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Annual Revenue</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="h-12 text-lg"
                                  placeholder="Enter your annual revenue"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>
                                Your company's total revenue for the last 12 months
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="financialData.growth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Growth Rate (%)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="h-12 text-lg"
                                  placeholder="Enter your growth rate"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>
                                Your year-over-year revenue growth rate
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>

                  <div className="mt-8 flex justify-end gap-4">
                    {step > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(step - 1)}
                      >
                        Previous
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className={cn(
                        "min-w-[120px]",
                        step === formSteps.length - 1 ? "bg-primary" : ""
                      )}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : step === formSteps.length - 1 ? (
                        "Calculate"
                      ) : (
                        <>
                          Next
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Form Progress */}
      <div className="mt-8 flex justify-center gap-2">
        {formSteps.map((formStep, idx) => (
          <div
            key={formStep.id}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-200",
              idx === step ? "bg-primary scale-125" : "bg-primary/20"
            )}
          />
        ))}
      </div>
    </motion.div>
  );
}