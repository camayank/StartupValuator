import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  revenueModel: z.string().default('SaaS'),
  annualRevenue: z.number().min(0, "Revenue cannot be negative"),
  employeeCount: z.number().min(0, "Employee count cannot be negative")
});

type BusinessInfoFormData = z.infer<typeof businessInfoSchema>;

interface BusinessInfoStepProps {
  sessionData: any;
  onComplete: (data: BusinessInfoFormData) => Promise<void>;
  onError: (type: string, error: any) => void;
}

export function BusinessInfoStep({ sessionData, onComplete, onError }: BusinessInfoStepProps) {
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [aiSuggestions, setAiSuggestions] = useState({});

  // Use force update hook to prevent form freezing
  useForceUpdate(5000); // 5 second refresh

  const form = useForm<BusinessInfoFormData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      companyName: sessionData.companyName || '',
      industry: sessionData.industry || '',
      revenueModel: sessionData.revenueModel || 'SaaS',
      annualRevenue: sessionData.annualRevenue || 0,
      employeeCount: sessionData.employeeCount || 0
    }
  });

  // Monitor form state changes
  useEffect(() => {
    console.log('Form State Updated:', form.getValues());
  }, [form.watch()]);

  // Add connection monitoring
  useEffect(() => {
    const heartbeat = setInterval(() => {
      fetch('/ping')
        .then(() => setConnectionStatus('connected'))
        .catch(() => setConnectionStatus('disconnected'));
    }, 5000);

    return () => clearInterval(heartbeat);
  }, []);

  const handleSubmit = async (values: BusinessInfoFormData) => {
    try {
      setIsValidating(true);

      // Final validation before submission
      const finalValidation = Object.entries(values).reduce((acc, [key, value]) => {
        const error = form.formState.errors[key]?.message;
        return error ? { ...acc, [key]: error } : acc;
      }, {});

      if (Object.keys(finalValidation).length > 0) {
        throw new Error('VALIDATION_FAILED');
      }

      await onComplete({
        ...values,
        aiSuggestions,
        validatedAt: new Date().toISOString()
      });

      toast({
        title: "Success",
        description: "Business information saved successfully.",
      });

    } catch (error) {
      console.error('Form submission error:', error);
      onError('SUBMIT_FAILED', {
        error,
        formData: values,
        validationErrors: form.formState.errors,
        aiSuggestions
      });

      toast({
        title: "Error",
        description: "Failed to save business information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Connection status warning
  if (connectionStatus === 'disconnected') {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        Connection lost. Please refresh the page.
      </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Business Information</CardTitle>
        <CardDescription>
          Enter your core business details to begin the valuation process
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter your company name" />
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
                name="employeeCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Employees</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="submit"
                disabled={isValidating}
              >
                {isValidating ? "Validating..." : "Continue"}
              </Button>
            </div>

            {/* Debug panel in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-gray-100 rounded">
                <h3 className="text-sm font-semibold">Debug Info</h3>
                <pre className="text-xs mt-2 overflow-auto">
                  {JSON.stringify({
                    formState: form.formState,
                    values: form.getValues(),
                    connectionStatus,
                    aiSuggestions
                  }, null, 2)}
                </pre>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default BusinessInfoStep;