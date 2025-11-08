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
// Stage-based revenue limits (in INR) for realistic validation
const STAGE_REVENUE_LIMITS_INR: Record<string, number> = {
  "Pre-seed / Idea Stage": 5000000,        // ₹50 Lakh max
  "Seed Stage": 50000000,                   // ₹5 Cr max
  "Series A": 500000000,                    // ₹50 Cr max
  "Series B": 2000000000,                   // ₹200 Cr max
  "Series C+": Number.POSITIVE_INFINITY,    // No limit
  "Revenue-generating (No funding yet)": 100000000  // ₹10 Cr max
};

// Currency multipliers for validation (convert to INR)
const CURRENCY_MULTIPLIERS: Record<string, number> = {
  INR: 1,
  USD: 88.5,
  EUR: 102.5,
  GBP: 116.3
};

const simpleValuationSchema = z.object({
  businessName: z.string().optional(),
  industry: z.string().min(1, "Please select an industry"),
  stage: z.string().min(1, "Please select a business stage"),
  revenue: z.number().min(0, "Revenue must be positive"),
  currency: z.string().default("INR"),
}).refine((data) => {
  // Convert revenue to INR for validation
  const revenueINR = data.revenue * (CURRENCY_MULTIPLIERS[data.currency] || 1);
  const limit = STAGE_REVENUE_LIMITS_INR[data.stage];
  
  if (limit && revenueINR > limit) {
    return false;
  }
  return true;
}, {
  message: "Revenue too high for this stage. Please verify your inputs or select a later stage.",
  path: ["revenue"],
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
      className="max-w-2xl mx-auto"
    >
      <Card className="border-2 border-primary/20 shadow-2xl bg-gradient-to-br from-background via-background to-primary/5">
        <CardHeader className="text-center space-y-3 pb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
          </motion.div>
          <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            World-Class Valuation Analysis
          </CardTitle>
          <CardDescription className="text-base max-w-xl mx-auto">
            Powered by insights from <span className="font-semibold text-primary">Aswath Damodaran</span> (NYU Professor), <span className="font-semibold text-primary">Sam Altman</span> (OpenAI), and <span className="font-semibold text-primary">Elon Musk</span>'s first principles thinking.
          </CardDescription>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Free Forever</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">AI-Powered</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Instant Results</span>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Business Name */}
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="e.g., TechStartup India" 
                        className="text-lg"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Leave blank if you prefer to keep it anonymous
                    </FormDescription>
                  </FormItem>
                )}
              />

              {/* Industry */}
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">1. What industry are you in? *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-lg h-12">
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

              {/* Stage */}
              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">2. What stage is your business at? *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-lg h-12">
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

              {/* Currency */}
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">3. Select your currency *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-lg h-12">
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

              {/* Revenue */}
              <FormField
                control={form.control}
                name="revenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">4. What's your annual revenue? *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                          {currencySymbol}
                        </span>
                        <Input
                          type="number"
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value))}
                          placeholder="0"
                          className="text-lg h-12 pl-8"
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Enter 0 if pre-revenue. We'll estimate your potential valuation!
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-16 text-lg font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isSubmitting || mutation.isPending}
                >
                  {isSubmitting || mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      AI Analyzing Your Startup...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-6 w-6" />
                      Get Expert Valuation (Free)
                    </>
                  )}
                </Button>
              </div>

              <div className="pt-4 space-y-2">
                <p className="text-center text-sm text-muted-foreground">
                  ✨ Our AI analyzes 200+ data points to provide comprehensive valuation
                </p>
                <p className="text-center text-xs text-muted-foreground">
                  🔒 Your data is secure • 🚀 Results in 3-5 seconds • 📊 Professional-grade analysis
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
