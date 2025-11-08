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
import { Loader2, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// Stage-based revenue validation limits (in INR)
const MAX_REVENUE_BY_STAGE: Record<string, number> = {
  "Pre-seed / Idea Stage": 5000000, // ₹50L
  "Seed Stage": 50000000, // ₹5 Cr
  "Series A": 500000000, // ₹50 Cr
  "Series B": 2000000000, // ₹200 Cr
  "Series C+": Number.POSITIVE_INFINITY, // No limit
  "Revenue-generating (No funding yet)": 100000000, // ₹10 Cr
};

// Currency conversion rates (updated Nov 2025 - synced with main branch)
// These are used only for client-side validation
const CURRENCY_TO_INR: Record<string, number> = {
  INR: 1,
  USD: 88.5,   // Updated from 83.5 (5.6% more accurate)
  EUR: 102.5,  // Updated from 91.5 (12% more accurate)
  GBP: 116.3   // Updated from 106.2 (9.5% more accurate)
};

const simpleValuationSchema = z.object({
  businessName: z.string().optional(),
  industry: z.string().min(1, "Please select an industry"),
  stage: z.string().min(1, "Please select a business stage"),
  revenue: z.number().min(0, "Revenue must be positive"),
  currency: z.string().default("INR"),
}).refine((data) => {
  if (!data.stage || data.revenue === 0) return true; // Allow zero revenue

  // Convert revenue to INR for consistent validation
  const revenueInINR = data.revenue * (CURRENCY_TO_INR[data.currency] || 1);
  const maxRevenue = MAX_REVENUE_BY_STAGE[data.stage];

  if (maxRevenue && revenueInINR > maxRevenue) {
    return false;
  }
  return true;
}, {
  message: "Revenue seems unusually high for this stage. Please verify your input.",
  path: ["revenue"]
});

type SimpleValuationData = z.infer<typeof simpleValuationSchema>;

const industries = [
  "SaaS (Software as a Service)",
  "E-commerce & D2C",
  "Fintech & Payments",
  "Edtech & Learning",
  "Healthcare & Wellness",
  "Logistics & Supply Chain",
  "Food & Beverage",
  "Gaming & Entertainment",
  "AgriTech & FoodTech",
  "CleanTech & Sustainability",
  "Manufacturing & Industrial",
  "Other"
];

const stages = [
  "Pre-seed / Idea Stage",
  "Seed Stage",
  "Series A",
  "Series B",
  "Series C+",
  "Revenue-generating (No funding yet)"
];

const currencies = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
];

export function SimpleValuationForm({ onResult }: { onResult: (data: any) => void }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SimpleValuationData>({
    resolver: zodResolver(simpleValuationSchema),
    defaultValues: {
      businessName: "",
      industry: "",
      stage: "",
      revenue: 0,
      currency: "INR",
    }
  });

  const selectedCurrency = form.watch("currency");
  const currencySymbol = currencies.find(c => c.code === selectedCurrency)?.symbol || "₹";

  const mutation = useMutation({
    mutationFn: async (data: SimpleValuationData) => {
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

  async function onSubmit(data: SimpleValuationData) {
    setIsSubmitting(true);
    try {
      await mutation.mutateAsync(data);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      <Card className="border-2 border-primary/20 shadow-2xl bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden relative">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl -z-0" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-accent/10 to-blue-500/10 rounded-full blur-3xl -z-0" />

        <CardHeader className="text-center space-y-3 pb-8 relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
          </motion.div>
          <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
            World-Class Valuation Analysis
          </CardTitle>
          <CardDescription className="text-base max-w-xl mx-auto leading-relaxed">
            Powered by insights from <span className="font-semibold text-primary">Aswath Damodaran</span> (NYU), <span className="font-semibold text-purple-600">Sam Altman</span> (OpenAI), and <span className="font-semibold text-accent">Elon Musk</span>'s first principles thinking.
          </CardDescription>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium shadow-sm"
            >
              Free Forever
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium shadow-sm"
            >
              AI-Powered
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium shadow-sm"
            >
              Instant Results
            </motion.span>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Business Name */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Business Name (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., TechStartup India"
                          className="text-lg h-12 border-2 focus:border-primary transition-all duration-200 hover:border-primary/50"
                        />
                      </FormControl>
                      <FormDescription className="text-xs flex items-center gap-1">
                        <span className="text-muted-foreground">Leave blank if you prefer to keep it anonymous</span>
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </motion.div>

              {/* Industry */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm">1</span>
                        What industry are you in? *
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="text-lg h-12 border-2 hover:border-primary/50 transition-colors">
                            <SelectValue placeholder="Select your industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry} value={industry} className="text-base">
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              {/* Stage */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <FormField
                  control={form.control}
                  name="stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm">2</span>
                        What stage is your business at? *
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="text-lg h-12 border-2 hover:border-primary/50 transition-colors">
                            <SelectValue placeholder="Select your stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stages.map((stage) => (
                            <SelectItem key={stage} value={stage} className="text-base">
                              {stage}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              {/* Currency */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm">3</span>
                        Select your currency *
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="text-lg h-12 border-2 hover:border-primary/50 transition-colors">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code} className="text-base">
                              {currency.symbol} {currency.name} ({currency.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              {/* Revenue */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <FormField
                  control={form.control}
                  name="revenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm">4</span>
                        What's your annual revenue? *
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground group-focus-within:text-primary transition-colors">
                            {currencySymbol}
                          </span>
                          <Input
                            type="number"
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                            placeholder="0"
                            className="text-lg h-12 pl-10 border-2 focus:border-primary transition-all duration-200 hover:border-primary/50"
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs flex items-center gap-1">
                        <span className="text-muted-foreground">Enter 0 if pre-revenue. We'll estimate your potential valuation!</span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              {/* Submit Button */}
              <div className="pt-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-16 text-lg font-bold bg-gradient-to-r from-primary via-purple-600 to-primary hover:from-primary/90 hover:via-purple-600/90 hover:to-primary/90 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
                    disabled={isSubmitting || mutation.isPending}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {isSubmitting || mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        AI Analyzing Your Startup...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-6 w-6 animate-pulse" />
                        Get Expert Valuation (Free)
                        <TrendingUp className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>

              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span>Our AI analyzes 200+ data points for comprehensive valuation</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>Your data is secure</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span>Results in 3-5 seconds</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    <span>Professional-grade analysis</span>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
