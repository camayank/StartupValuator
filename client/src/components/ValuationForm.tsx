import { useState } from "react";
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
import { ValuationProgress } from "@/components/ui/valuation-progress";
import { ValuationStepCard } from "@/components/ui/valuation-step-card";
import { valuationFormSchema, type ValuationFormData, currencies, businessStages } from "@/lib/validations";

interface ValuationFormProps {
  onResult: (data: any) => void;
}

export function ValuationForm({ onResult }: ValuationFormProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0); // Start at welcome screen
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const form = useForm<ValuationFormData>({
    resolver: zodResolver(valuationFormSchema),
    defaultValues: {
      revenue: 0,
      currency: "USD",
      growthRate: 0,
      margins: 0,
      industry: "tech",
      stage: "ideation_unvalidated",
      intellectualProperty: "none",
      teamExperience: 5,
      marketValidation: "none",
      competitiveDifferentiation: "medium",
      scalability: "moderate",
      companyName: ""
    },
  });

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
        const error = await response.text();
        throw new Error(error);
      }

      return response.json();
    },
    onSuccess: (data) => {
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

  const handleSubmit = form.handleSubmit((data) => {
    const formattedData = {
      ...data,
      revenue: Number(data.revenue) || 0,
      growthRate: Number(data.growthRate) || 0,
      margins: Number(data.margins) || 0,
      teamExperience: Number(data.teamExperience) || 0,
    };
    mutation.mutate(formattedData);
  });

  // Welcome screen
  if (currentStep === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl mb-2">Welcome to the Valuation Wizard</CardTitle>
          <p className="text-gray-500">
            Let's guide you through the process of valuing your business using our AI-powered platform.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {[
              { title: "Business Information", desc: "Tell us about your business type and stage" },
              { title: "Valuation Method", desc: "Review and select the recommended valuation approach" },
              { title: "Financial Details", desc: "Provide basic financial information" },
              { title: "Review", desc: "Review and confirm your information" }
            ].map((step, i) => (
              <div key={i} className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
          <Button onClick={() => setCurrentStep(1)} className="w-full">
            Get Started
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
        <ValuationProgress currentStep={currentStep} completedSteps={completedSteps} />

        <ValuationStepCard
          title="Business Information"
          description="Tell us about your business type and stage"
          stepNumber={1}
          currentStep={currentStep}
          isCompleted={completedSteps.includes(1)}
          onComplete={() => handleStepComplete(1)}
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
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
                      {Object.entries(businessStages).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
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
          stepNumber={2}
          currentStep={currentStep}
          isCompleted={completedSteps.includes(2)}
          onComplete={() => handleStepComplete(2)}
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="marketValidation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Market Validation</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select validation level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="early">Early Traction</SelectItem>
                      <SelectItem value="proven">Proven</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="competitiveDifferentiation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Competitive Differentiation</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
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
          stepNumber={3}
          currentStep={currentStep}
          isCompleted={completedSteps.includes(3)}
          onComplete={() => handleStepComplete(3)}
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
                        value={field.value || 0}
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
                        {Object.entries(currencies).map(([code, { name, symbol }]) => (
                          <SelectItem key={code} value={code}>
                            {symbol} - {name}
                          </SelectItem>
                        ))}
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
                  <FormLabel>Annual Growth Rate (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                      value={field.value || 0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="margins"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profit Margins (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                      value={field.value || 0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </ValuationStepCard>

        <ValuationStepCard
          title="Market Analysis"
          description="Industry and competition insights"
          stepNumber={4}
          currentStep={currentStep}
          isCompleted={completedSteps.includes(4)}
          onComplete={() => handleStepComplete(4)}
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="scalability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scalability Potential</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select potential" />
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
                  <FormLabel>Intellectual Property Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          </div>
        </ValuationStepCard>

        <ValuationStepCard
          title="Review"
          description="Review and confirm your information"
          stepNumber={5}
          currentStep={currentStep}
          isCompleted={completedSteps.includes(5)}
          onComplete={handleSubmit}
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