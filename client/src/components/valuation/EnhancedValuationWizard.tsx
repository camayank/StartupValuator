import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
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
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, TrendingUp, ArrowRight, ArrowLeft, HelpCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// Form schema with validation
const valuationSchema = z.object({
  businessName: z.string().optional(),
  industry: z.string().min(1, "Please select an industry"),
  stage: z.string().min(1, "Please select a business stage"),
  revenue: z.number().min(0, "Revenue must be positive"),
  currency: z.string().default("INR"),
  growthRate: z.number().min(-100).max(1000).optional(),
  teamSize: z.number().min(1).max(10000).optional(),
  fundingRaised: z.number().min(0).optional(),
});

type ValuationData = z.infer<typeof valuationSchema>;

const industries = [
  { value: "saas", label: "SaaS (Software as a Service)", description: "Cloud-based software solutions" },
  { value: "ecommerce", label: "E-commerce & D2C", description: "Online retail and direct-to-consumer" },
  { value: "fintech", label: "Fintech & Payments", description: "Financial technology solutions" },
  { value: "edtech", label: "Edtech & Learning", description: "Educational technology" },
  { value: "healthtech", label: "Healthcare & Wellness", description: "Health and medical technology" },
  { value: "logistics", label: "Logistics & Supply Chain", description: "Transportation and delivery" },
  { value: "food", label: "Food & Beverage", description: "Food services and products" },
  { value: "gaming", label: "Gaming & Entertainment", description: "Games and media" },
  { value: "agritech", label: "AgriTech & FoodTech", description: "Agriculture technology" },
  { value: "cleantech", label: "CleanTech & Sustainability", description: "Environmental solutions" },
  { value: "manufacturing", label: "Manufacturing & Industrial", description: "Production and industrial" },
  { value: "other", label: "Other", description: "Other industries" },
];

const stages = [
  { value: "pre-seed", label: "Pre-seed / Idea Stage", description: "Concept or early development" },
  { value: "seed", label: "Seed Stage", description: "Early product with initial traction" },
  { value: "series-a", label: "Series A", description: "Proven product-market fit" },
  { value: "series-b", label: "Series B", description: "Scaling operations" },
  { value: "series-c", label: "Series C+", description: "Mature and expanding" },
  { value: "revenue", label: "Revenue-generating (No funding yet)", description: "Bootstrapped with revenue" },
];

const currencies = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
];

interface Props {
  onResult: (data: any) => void;
}

export function EnhancedValuationWizard({ onResult }: Props) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const form = useForm<ValuationData>({
    resolver: zodResolver(valuationSchema),
    defaultValues: {
      businessName: "",
      industry: "",
      stage: "",
      revenue: 0,
      currency: "INR",
      growthRate: undefined,
      teamSize: undefined,
      fundingRaised: undefined,
    }
  });

  const selectedCurrency = form.watch("currency");
  const currencySymbol = currencies.find(c => c.code === selectedCurrency)?.symbol || "₹";
  const selectedIndustry = form.watch("industry");
  const selectedStage = form.watch("stage");

  const mutation = useMutation({
    mutationFn: async (data: ValuationData) => {
      const response = await fetch('/api/valuation/simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to calculate valuation');
      }
      return response.json();
    },
    onSuccess: (data) => {
      onResult(data);
      toast({
        title: "✨ Valuation Complete!",
        description: "Your AI-powered valuation is ready",
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

  async function onSubmit(data: ValuationData) {
    await mutation.mutateAsync(data);
  }

  const progress = (currentStep / totalSteps) * 100;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return !!selectedIndustry && !!selectedStage;
    }
    if (currentStep === 2) {
      return form.getValues("revenue") >= 0;
    }
    return true;
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="border-2 border-primary/20 shadow-2xl bg-gradient-to-br from-background via-background to-primary/5">
          <CardHeader className="text-center space-y-4 pb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
            </motion.div>
            <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Professional Valuation Analysis
            </CardTitle>
            <CardDescription className="text-base max-w-2xl mx-auto">
              Step-by-step valuation powered by industry-leading methodologies
            </CardDescription>

            {/* Progress Bar */}
            <div className="space-y-3 pt-4">
              <div className="flex justify-between text-sm text-muted-foreground px-4">
                <span className={currentStep >= 1 ? "text-primary font-semibold" : ""}>
                  Business Info
                </span>
                <span className={currentStep >= 2 ? "text-primary font-semibold" : ""}>
                  Financials
                </span>
                <span className={currentStep >= 3 ? "text-primary font-semibold" : ""}>
                  Additional Details
                </span>
              </div>
              <div className="relative">
                <Progress value={progress} className="h-3" />
                <div className="absolute inset-0 flex justify-between px-1">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold -mt-1.5 ${
                        currentStep >= step
                          ? "bg-primary border-primary text-white"
                          : "bg-background border-muted text-muted-foreground"
                      }`}
                    >
                      {currentStep > step ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        step
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <AnimatePresence mode="wait">
                  {/* Step 1: Business Information */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold mb-2">Tell us about your business</h3>
                        <p className="text-muted-foreground">Basic information to get started</p>
                      </div>

                      {/* Business Name */}
                      <FormField
                        control={form.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Business Name (Optional)
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Your company or startup name</p>
                                </TooltipContent>
                              </Tooltip>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g., TechStartup India"
                                className="text-lg h-12"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Industry */}
                      <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Industry *
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Your primary business sector</p>
                                </TooltipContent>
                              </Tooltip>
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12">
                                  <SelectValue placeholder="Select your industry" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {industries.map((industry) => (
                                  <SelectItem key={industry.value} value={industry.value}>
                                    <div className="flex flex-col items-start">
                                      <span className="font-medium">{industry.label}</span>
                                      <span className="text-xs text-muted-foreground">{industry.description}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Stage */}
                      <FormField
                        control={form.control}
                        name="stage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Funding Stage *
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Your current funding/development stage</p>
                                </TooltipContent>
                              </Tooltip>
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12">
                                  <SelectValue placeholder="Select your stage" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {stages.map((stage) => (
                                  <SelectItem key={stage.value} value={stage.value}>
                                    <div className="flex flex-col items-start">
                                      <span className="font-medium">{stage.label}</span>
                                      <span className="text-xs text-muted-foreground">{stage.description}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}

                  {/* Step 2: Financial Information */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold mb-2">Financial Metrics</h3>
                        <p className="text-muted-foreground">Help us understand your financial position</p>
                      </div>

                      {/* Currency Selection */}
                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {currencies.map((currency) => (
                                  <SelectItem key={currency.code} value={currency.code}>
                                    {currency.symbol} - {currency.name} ({currency.code})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Annual Revenue */}
                      <FormField
                        control={form.control}
                        name="revenue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Annual Revenue *
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Your total annual revenue (enter 0 if pre-revenue)</p>
                                </TooltipContent>
                              </Tooltip>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
                                  {currencySymbol}
                                </span>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  placeholder="0"
                                  className="pl-10 text-lg h-14 font-semibold"
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Total revenue in the last 12 months
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Growth Rate */}
                      <FormField
                        control={form.control}
                        name="growthRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Growth Rate (Optional)
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Year-over-year growth rate as a percentage</p>
                                </TooltipContent>
                              </Tooltip>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  placeholder="e.g., 120 for 120% growth"
                                  className="pr-10 text-lg h-12"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                  %
                                </span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}

                  {/* Step 3: Additional Details */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold mb-2">Additional Information</h3>
                        <p className="text-muted-foreground">Optional details for more accurate valuation</p>
                      </div>

                      {/* Team Size */}
                      <FormField
                        control={form.control}
                        name="teamSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Team Size (Optional)
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Total number of full-time employees</p>
                                </TooltipContent>
                              </Tooltip>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                placeholder="e.g., 15"
                                className="text-lg h-12"
                              />
                            </FormControl>
                            <FormDescription>Number of full-time team members</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Previous Funding */}
                      <FormField
                        control={form.control}
                        name="fundingRaised"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Previous Funding Raised (Optional)
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Total funding raised to date</p>
                                </TooltipContent>
                              </Tooltip>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
                                  {currencySymbol}
                                </span>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  placeholder="0"
                                  className="pl-10 text-lg h-12"
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Total amount raised in all previous rounds
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Summary Preview */}
                      <div className="mt-8 p-6 rounded-lg bg-muted/30 border-2 border-primary/10">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-primary" />
                          Valuation Summary
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Industry</p>
                            <p className="font-semibold">
                              {industries.find(i => i.value === selectedIndustry)?.label || "Not selected"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Stage</p>
                            <p className="font-semibold">
                              {stages.find(s => s.value === selectedStage)?.label || "Not selected"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Currency</p>
                            <p className="font-semibold">{selectedCurrency}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Revenue</p>
                            <p className="font-semibold">
                              {currencySymbol}{form.getValues("revenue")?.toLocaleString() || "0"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <div className="text-sm text-muted-foreground">
                    Step {currentStep} of {totalSteps}
                  </div>

                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!canProceed()}
                      className="gap-2"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={mutation.isPending}
                      className="gap-2 min-w-[140px]"
                    >
                      {mutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Calculating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Get Valuation
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <p className="text-center text-xs text-muted-foreground pt-2">
                  🔒 Your data is encrypted and secure. We never share your information.
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
}
