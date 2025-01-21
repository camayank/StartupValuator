import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { valuationFormSchema } from "@/lib/validations";
import type { ValuationFormData } from "@/lib/validations";
import { useFormAutoSave } from "@/hooks/use-form-autosave";
import { ErrorDisplay } from "@/components/ui/error-display";
import { ProgressFeedback } from "@/components/ui/progress-feedback";
import { motion } from "framer-motion";
import { Building2, Calculator, ChartBar, ClipboardCheck, Globe } from "lucide-react";
import SmartSlider from "@/components/SmartSlider"; // Assuming this import is correct

interface ValuationFormProps {
  onResult: (data: ValuationFormData) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
};

export function ValuationForm({ onResult }: ValuationFormProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const form = useForm<ValuationFormData>({
    resolver: zodResolver(valuationFormSchema),
    defaultValues: {
      businessName: "",
      region: "global",
      complianceStandard: "",
      valuationPurpose: "fundraising",
      revenue: 0,
      currency: "USD",
      growthRate: 0,
      margins: 0,
      industry: "tech",
      stage: "ideation",
      intellectualProperty: "none",
      teamExperience: 0,
      scalability: "low",
      details: ""
    },
  });

  // Initialize auto-save functionality
  const { loadSavedData, clearSavedData } = useFormAutoSave(form.watch());

  // Load saved data on mount
  useEffect(() => {
    const savedData = loadSavedData();
    if (savedData) {
      Object.keys(savedData).forEach((key) => {
        form.setValue(key as keyof ValuationFormData, savedData[key]);
      });
    }
  }, []);

  const mutation = useMutation({
    mutationFn: async (data: ValuationFormData) => {
      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: (data) => {
      clearSavedData(); // Clear saved data after successful submission
      onResult(data);
      toast({
        title: "Valuation calculated",
        description: "Your startup valuation has been updated.",
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

  const handleStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
    setCurrentStep(step + 1);
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Welcome screen
  if (currentStep === 0) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-2xl mx-auto"
      >
        <Card className="overflow-hidden">
          <CardHeader className="text-center pb-8">
            <motion.div variants={itemVariants}>
              <CardTitle className="text-3xl font-bold mb-4">Welcome to the Valuation Wizard</CardTitle>
              <p className="text-lg text-muted-foreground">
                Let's guide you through the process of valuing your business using our AI-powered platform.
              </p>
            </motion.div>
          </CardHeader>
          <CardContent className="space-y-8">
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {[
                {
                  title: "Business Information",
                  desc: "Tell us about your business type and stage",
                  icon: Building2
                },
                {
                  title: "Region & Standards",
                  desc: "Select your region and applicable standards",
                  icon: Globe
                },
                {
                  title: "Valuation Method",
                  desc: "Review region-specific valuation approaches",
                  icon: Calculator
                },
                {
                  title: "Financial Details",
                  desc: "Provide basic financial information",
                  icon: ChartBar
                },
                {
                  title: "Review",
                  desc: "Review and confirm your information",
                  icon: ClipboardCheck
                }
              ].map((step, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <Card className="transition-all duration-300 group-hover:shadow-md border-2 group-hover:border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-primary/5 text-primary">
                          <step.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                          <p className="text-sm text-muted-foreground">{step.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
            <motion.div variants={itemVariants} className="pt-4">
              <Button
                onClick={() => setCurrentStep(1)}
                className="w-full py-6 text-lg"
                variant="default"
              >
                Get Started
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(mutation.mutate)} className="space-y-6 max-w-4xl mx-auto">
        <ProgressFeedback
          currentStep={currentStep}
          totalSteps={5}
          stepTitles={[
            "Business Information",
            "Region & Standards",
            "Valuation Method",
            "Financial Details",
            "Review"
          ]}
        />
        <ValuationStepCard
          title="Business Information"
          description="Tell us about your business type and stage"
          stepNumber={1}
          currentStep={currentStep}
          isCompleted={completedSteps.includes(1)}
          onComplete={() => handleStepComplete(1)}
          className="mt-6"
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="tech">Technology</SelectItem>
                      <SelectItem value="ecommerce">E-Commerce</SelectItem>
                      <SelectItem value="saas">SaaS</SelectItem>
                      <SelectItem value="marketplace">Marketplace</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Stage</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ideation">Ideation</SelectItem>
                      <SelectItem value="mvp">MVP</SelectItem>
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="scale">Scale</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </ValuationStepCard>

        <ValuationStepCard
          title="Region & Standards"
          description="Select your region and applicable standards"
          stepNumber={2}
          currentStep={currentStep}
          isCompleted={completedSteps.includes(2)}
          onComplete={() => handleStepComplete(2)}
          onBack={handleStepBack}
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Region</FormLabel>
                  <Select onValueChange={(value) => {
                    field.onChange(value);
                    // Reset compliance standard when region changes
                    form.setValue('complianceStandard', '');
                  }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="eu">European Union</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="india">India</SelectItem>
                      <SelectItem value="global">Global</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="complianceStandard"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compliance Standard</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!form.watch('region')}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select applicable standard" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {form.watch('region') === 'us' && (
                        <>
                          <SelectItem value="aicpa">AICPA Valuation Standards</SelectItem>
                          <SelectItem value="uspap">USPAP Standards</SelectItem>
                          <SelectItem value="sec">SEC Guidelines</SelectItem>
                        </>
                      )}
                      {form.watch('region') === 'eu' && (
                        <>
                          <SelectItem value="evs">European Valuation Standards (EVS)</SelectItem>
                          <SelectItem value="ifrs">IFRS Standards</SelectItem>
                        </>
                      )}
                      {form.watch('region') === 'uk' && (
                        <>
                          <SelectItem value="rics">RICS Valuation Standards</SelectItem>
                          <SelectItem value="frs">FRS 102</SelectItem>
                        </>
                      )}
                      {form.watch('region') === 'india' && (
                        <>
                          <SelectItem value="icai">ICAI Valuation Standards</SelectItem>
                          <SelectItem value="sebi">SEBI Guidelines</SelectItem>
                        </>
                      )}
                      {form.watch('region') === 'global' && (
                        <>
                          <SelectItem value="ivs">International Valuation Standards (IVS)</SelectItem>
                          <SelectItem value="ifrs">IFRS Standards</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </ValuationStepCard>

        <ValuationStepCard
          title="Valuation Method"
          description="Review and select the recommended valuation approach"
          stepNumber={3}
          currentStep={currentStep}
          isCompleted={completedSteps.includes(3)}
          onComplete={() => handleStepComplete(3)}
          onBack={handleStepBack}
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="valuationPurpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valuation Purpose</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fundraising">Fundraising</SelectItem>
                      <SelectItem value="acquisition">Acquisition</SelectItem>
                      <SelectItem value="internal">Internal Planning</SelectItem>
                      <SelectItem value="exit_planning">Exit Planning</SelectItem>
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
                  <FormLabel>Intellectual Property Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select IP status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="pending">Pending Patents/IP</SelectItem>
                      <SelectItem value="granted">Granted Patents/IP</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scalability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scalability Potential</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select scalability" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </ValuationStepCard>

        <ValuationStepCard
          title="Financial Details"
          description="Provide basic financial information"
          stepNumber={4}
          currentStep={currentStep}
          isCompleted={completedSteps.includes(4)}
          onComplete={() => handleStepComplete(4)}
          onBack={handleStepBack}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="revenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Revenue</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="growthRate"
              render={({ field }) => (
                <FormItem>
                  <SmartSlider
                    label="Annual Growth Rate (%)"
                    value={field.value}
                    onChange={value => field.onChange(value)}
                    min={0}
                    max={200}
                    step={5}
                    benchmarks={[
                      { value: 20, label: "Steady", description: "Stable, sustainable growth" },
                      { value: 50, label: "Fast", description: "Rapid expansion phase" },
                      { value: 100, label: "Hyper", description: "Exponential growth" },
                      { value: 200, label: "Unicorn", description: "Exceptional performance" }
                    ]}
                    tooltip={{
                      title: "Growth Rate",
                      description: "Annual revenue growth as a percentage. Industry standards vary by sector and stage."
                    }}
                    className="mb-6"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="margins"
              render={({ field }) => (
                <FormItem>
                  <SmartSlider
                    label="Profit Margins (%)"
                    value={field.value}
                    onChange={value => field.onChange(value)}
                    min={-50}
                    max={100}
                    step={5}
                    benchmarks={[
                      { value: 0, label: "Break-even", description: "Revenue equals costs" },
                      { value: 20, label: "Healthy", description: "Sustainable profitability" },
                      { value: 50, label: "Premium", description: "High-margin business" },
                      { value: 80, label: "Elite", description: "Industry-leading efficiency" }
                    ]}
                    tooltip={{
                      title: "Profit Margins",
                      description: "Net profit as a percentage of revenue. Higher margins often indicate stronger business models."
                    }}
                    className="mb-6"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="teamExperience"
              render={({ field }) => (
                <FormItem>
                  <SmartSlider
                    label="Team Experience Level"
                    value={field.value}
                    onChange={value => field.onChange(value)}
                    min={0}
                    max={100}
                    step={10}
                    benchmarks={[
                      { value: 25, label: "Early", description: "Growing expertise" },
                      { value: 50, label: "Mid", description: "Established track record" },
                      { value: 75, label: "Senior", description: "Industry veterans" },
                      { value: 100, label: "Expert", description: "World-class leadership" }
                    ]}
                    tooltip={{
                      title: "Team Experience",
                      description: "Combined expertise and industry experience of the core team."
                    }}
                    className="mb-6"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </ValuationStepCard>

        <ValuationStepCard
          title="Review"
          description="Review and confirm your information"
          stepNumber={5}
          currentStep={currentStep}
          isCompleted={completedSteps.includes(5)}
          onComplete={form.handleSubmit(mutation.mutate)}
          onBack={handleStepBack}
        >
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Please review your information</h3>
              <p className="text-sm text-gray-500">
                Make sure all the information you've provided is accurate before proceeding with the valuation calculation.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Calculating..." : "Calculate Valuation"}
            </Button>
          </div>
        </ValuationStepCard>
      </form>
    </Form>
  );
}