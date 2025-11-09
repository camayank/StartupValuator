import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calculator, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const quickCalculatorSchema = z.object({
  revenue: z.enum(['pre_revenue', '1_25l', '25l_1cr', '1cr_plus'], {
    required_error: "Please select your revenue range",
  }),
  stage: z.enum(['ideation', 'launched', 'growing', 'profitable'], {
    required_error: "Please select your current stage",
  }),
  sector: z.string().min(1, "Please select a sector"),
  dpiitRecognized: z.enum(['yes', 'no', 'dont_know'], {
    required_error: "Please indicate DPIIT recognition status",
  }),
  customers: z.string().optional(),
  fundingRaised: z.string().optional(),
});

type QuickCalculatorFormData = z.infer<typeof quickCalculatorSchema>;

export function QuickCalculator() {
  const [, setLocation] = useLocation();
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuickCalculatorFormData>({
    resolver: zodResolver(quickCalculatorSchema),
  });

  const revenue = watch("revenue");

  const onSubmit = async (data: QuickCalculatorFormData) => {
    setIsCalculating(true);

    try {
      const payload = {
        revenue: data.revenue,
        stage: data.stage,
        sector: data.sector,
        dpiitRecognized: data.dpiitRecognized === 'yes',
        customers: data.customers ? parseInt(data.customers) : undefined,
        fundingRaised: data.fundingRaised ? parseInt(data.fundingRaised) : undefined,
      };

      const response = await fetch('/api/quick-calculator/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate valuation');
      }

      const result = await response.json();

      // Store result in session storage
      sessionStorage.setItem('quickCalculatorResult', JSON.stringify(result.data));

      // Navigate to result page
      setLocation('/calculator-result');
    } catch (error) {
      console.error('Calculator error:', error);
      toast({
        title: "Calculation Error",
        description: "Failed to calculate valuation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-primary-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center mb-4">
            <div className="bg-primary-100 p-3 rounded-full">
              <Calculator className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Try Our Free Calculator
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get an instant valuation estimate in under 2 minutes
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span>No signup required</span>
            </div>
            <span>•</span>
            <span>100% Free</span>
            <span>•</span>
            <span>Instant results</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="shadow-2xl border-2">
            <CardHeader className="bg-gradient-to-r from-primary-50 to-purple-50">
              <CardTitle>Quick Valuation Calculator</CardTitle>
              <CardDescription>
                Answer a few questions to get your startup valuation estimate
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Revenue Question */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    What's your annual revenue? *
                  </Label>
                  <RadioGroup
                    onValueChange={(value) => setValue("revenue", value as any)}
                    className="grid grid-cols-2 gap-3"
                  >
                    {[
                      { value: 'pre_revenue', label: 'Pre-revenue', sublabel: '₹0' },
                      { value: '1_25l', label: '₹1-25 Lakhs', sublabel: 'Early revenue' },
                      { value: '25l_1cr', label: '₹25L-1 Cr', sublabel: 'Growing' },
                      { value: '1cr_plus', label: '₹1 Cr+', sublabel: 'Established' },
                    ].map((option) => (
                      <div key={option.value}>
                        <RadioGroupItem
                          value={option.value}
                          id={option.value}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={option.value}
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-primary-600 peer-data-[state=checked]:bg-primary-50 cursor-pointer transition-all"
                        >
                          <span className="text-sm font-semibold">{option.label}</span>
                          <span className="text-xs text-gray-500">{option.sublabel}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.revenue && (
                    <p className="text-sm text-red-600">{errors.revenue.message}</p>
                  )}
                </div>

                {/* Stage Question */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    What stage are you at? *
                  </Label>
                  <RadioGroup
                    onValueChange={(value) => setValue("stage", value as any)}
                    className="grid grid-cols-2 gap-3"
                  >
                    {[
                      { value: 'ideation', label: 'Ideation/MVP', sublabel: 'Building' },
                      { value: 'launched', label: 'Launched', sublabel: 'With customers' },
                      { value: 'growing', label: 'Growing', sublabel: 'Scaling up' },
                      { value: 'profitable', label: 'Profitable', sublabel: 'Sustainable' },
                    ].map((option) => (
                      <div key={option.value}>
                        <RadioGroupItem
                          value={option.value}
                          id={`stage-${option.value}`}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={`stage-${option.value}`}
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-primary-600 peer-data-[state=checked]:bg-primary-50 cursor-pointer transition-all"
                        >
                          <span className="text-sm font-semibold">{option.label}</span>
                          <span className="text-xs text-gray-500">{option.sublabel}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.stage && (
                    <p className="text-sm text-red-600">{errors.stage.message}</p>
                  )}
                </div>

                {/* Sector Selection */}
                <div className="space-y-3">
                  <Label htmlFor="sector" className="text-base font-semibold">
                    Select your sector: *
                  </Label>
                  <Select onValueChange={(value) => setValue("sector", value)}>
                    <SelectTrigger id="sector" className="h-12">
                      <SelectValue placeholder="Choose a sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fintech">Fintech</SelectItem>
                      <SelectItem value="saas">SaaS</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="healthtech">Healthtech</SelectItem>
                      <SelectItem value="edtech">Edtech</SelectItem>
                      <SelectItem value="agritech">Agritech</SelectItem>
                      <SelectItem value="logistics">Logistics & Supply Chain</SelectItem>
                      <SelectItem value="d2c">D2C / Consumer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.sector && (
                    <p className="text-sm text-red-600">{errors.sector.message}</p>
                  )}
                </div>

                {/* DPIIT Recognition */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    Are you DPIIT recognized? *
                  </Label>
                  <RadioGroup
                    onValueChange={(value) => setValue("dpiitRecognized", value as any)}
                    className="flex gap-4"
                  >
                    {[
                      { value: 'yes', label: 'Yes' },
                      { value: 'no', label: 'No' },
                      { value: 'dont_know', label: "Don't know" },
                    ].map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`dpiit-${option.value}`} />
                        <Label htmlFor={`dpiit-${option.value}`} className="cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.dpiitRecognized && (
                    <p className="text-sm text-red-600">{errors.dpiitRecognized.message}</p>
                  )}
                </div>

                {/* Conditional: Number of Customers */}
                {revenue !== 'pre_revenue' && (
                  <div className="space-y-3">
                    <Label htmlFor="customers" className="text-base font-semibold">
                      How many active customers? (Optional)
                    </Label>
                    <Input
                      id="customers"
                      type="number"
                      placeholder="e.g., 100"
                      {...register("customers")}
                      className="h-12"
                    />
                  </div>
                )}

                {/* Conditional: Funding Raised */}
                <div className="space-y-3">
                  <Label htmlFor="fundingRaised" className="text-base font-semibold">
                    Any funding raised? (Optional)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      ₹
                    </span>
                    <Input
                      id="fundingRaised"
                      type="number"
                      placeholder="Amount in Lakhs"
                      {...register("fundingRaised")}
                      className="pl-8 h-12"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="space-y-4">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isCalculating}
                    className="w-full h-14 text-lg font-semibold"
                  >
                    {isCalculating ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Calculating...
                      </>
                    ) : (
                      <>
                        Calculate My Valuation
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>

                  <p className="text-center text-sm text-gray-500">
                    🎉 100% Free • No signup required • Takes 30 seconds
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
