import { useState, useEffect } from "react";
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
import { Loader2, ArrowRight, Building2, ChartBar, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { valuationFormSchema, type ValuationFormData } from "@/lib/validations";
import { businessSectorSchema, businessStageSchema, businessModelSchema } from "@/lib/validations";

// WebSocket connection setup
const setupWebSocket = () => {
  // Temporarily disabled WebSocket for development
  return null;
};

export function ValuationForm({ onResult }: { onResult: (data: ValuationFormData) => void }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // WebSocket temporarily disabled for development
    setWsStatus('connected');
  }, []);

  const form = useForm<ValuationFormData>({
    resolver: zodResolver(valuationFormSchema),
    defaultValues: {
      businessInfo: {
        name: "",
        sector: "SaaS",
        industry: "",
        location: "",
        productStage: "concept",
        businessModel: "subscription"
      },
      financialData: {
        revenue: 0,
        cac: 0,
        ltv: 0,
        burnRate: 0,
        runway: 0
      },
      marketData: {
        tam: 0,
        sam: 0,
        som: 0,
        growthRate: 0,
        competitors: []
      }
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: ValuationFormData) => {
      try {
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
      } catch (error) {
        console.error('Mutation error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      onResult(data);
      toast({
        title: "Success!",
        description: "Your valuation has been calculated.",
      });
      // WebSocket success event temporarily disabled
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >


      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Business Information Section */}
          <Card className="bg-gradient-to-br from-primary/5 via-background to-background border border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Business Information
              </CardTitle>
              <CardDescription>Tell us about your company</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="businessInfo.name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-background/50" placeholder="Enter company name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessInfo.sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sector</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sector" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(businessSectorSchema.enum).map((sector) => (
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
                name="businessInfo.productStage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Stage</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(businessStageSchema.enum).map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {stage.charAt(0).toUpperCase() + stage.slice(1).replace('_', ' ')}
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
                name="businessInfo.businessModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Model</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(businessModelSchema.enum).map((model) => (
                          <SelectItem key={model} value={model}>
                            {model.charAt(0).toUpperCase() + model.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Financial Metrics Section */}
          <Card className="bg-gradient-to-br from-primary/5 via-background to-background border border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartBar className="h-5 w-5 text-primary" />
                Financial Metrics
              </CardTitle>
              <CardDescription>Enter your key financial data</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="financialData.revenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Revenue</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                        className="bg-background/50"
                        placeholder="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="financialData.cac"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Acquisition Cost (CAC)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                        className="bg-background/50"
                        placeholder="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="financialData.ltv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Lifetime Value (LTV)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                        className="bg-background/50"
                        placeholder="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="financialData.burnRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Burn Rate</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                        className="bg-background/50"
                        placeholder="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Market Analysis Section */}
          <Card className="bg-gradient-to-br from-primary/5 via-background to-background border border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Market Analysis
              </CardTitle>
              <CardDescription>Provide market information</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="marketData.tam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Addressable Market (TAM)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                        className="bg-background/50"
                        placeholder="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketData.sam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serviceable Addressable Market (SAM)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                        className="bg-background/50"
                        placeholder="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketData.som"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serviceable Obtainable Market (SOM)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                        className="bg-background/50"
                        placeholder="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketData.growthRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market Growth Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                        className="bg-background/50"
                        placeholder="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || wsStatus !== 'connected'}
              className={cn(
                "min-w-[200px] bg-primary hover:bg-primary/90",
                (isSubmitting || wsStatus !== 'connected') && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  Calculate Valuation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}