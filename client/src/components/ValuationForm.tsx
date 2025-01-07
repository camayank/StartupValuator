import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
  const [currentStep, setCurrentStep] = useState(1);
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
      companyName: "" // Added companyName field to defaultValues
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
        description: error instanceof Error ? error.message : "Failed to calculate valuation. Please try again.",
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

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <ValuationProgress currentStep={currentStep} completedSteps={completedSteps} />

        {/* Step 1: Company Information */}
        <ValuationStepCard
          title="Company Information"
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
                  <FormLabel>Stage</FormLabel>
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

        {/* Step 2: Financial Metrics */}
        <ValuationStepCard
          title="Financial Metrics"
          stepNumber={2}
          currentStep={currentStep}
          isCompleted={completedSteps.includes(2)}
          onComplete={() => handleStepComplete(2)}
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

        {/* Step 3: Market Analysis */}
        <ValuationStepCard
          title="Market Analysis"
          stepNumber={3}
          currentStep={currentStep}
          isCompleted={completedSteps.includes(3)}
          onComplete={() => handleStepComplete(3)}
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
                        <SelectValue placeholder="Select differentiation level" />
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

        {/* Step 4: Growth Projections */}
        <ValuationStepCard
          title="Growth Projections"
          stepNumber={4}
          currentStep={currentStep}
          isCompleted={completedSteps.includes(4)}
          onComplete={() => handleStepComplete(4)}
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="growthRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Growth Rate (%)</FormLabel>
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
              name="scalability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scalability Potential</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select scalability level" />
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
          </div>
        </ValuationStepCard>

        {/* Step 5: Risk Assessment */}
        <ValuationStepCard
          title="Risk Assessment"
          stepNumber={5}
          currentStep={currentStep}
          isCompleted={completedSteps.includes(5)}
          onComplete={() => handleSubmit()}
        >
          <div className="space-y-4">
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

            <FormField
              control={form.control}
              name="teamExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Experience (0-10)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="10"
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

        {currentStep > 5 && (
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Calculating..." : "Calculate Valuation"}
          </Button>
        )}
      </form>
    </Form>
  );
}