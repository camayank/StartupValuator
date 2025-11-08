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

  // Use force update hook with optimized interval
  useForceUpdate(2000); // Reduced interval for more responsive updates

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

  // Form state persistence
  useEffect(() => {
    const savedState = localStorage.getItem('businessInfoForm');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        Object.entries(parsedState).forEach(([key, value]) => {
          form.setValue(key as keyof BusinessInfoFormData, value);
        });
      } catch (e) {
        console.error('Failed to restore form state:', e);
      }
    }

    // Listen for state restoration events
    const handleStateRestore = (event: CustomEvent) => {
      const restoredState = event.detail;
      Object.entries(restoredState).forEach(([key, value]) => {
        form.setValue(key as keyof BusinessInfoFormData, value);
      });
    };

    window.addEventListener('restoreFormState', handleStateRestore as EventListener);
    return () => {
      window.removeEventListener('restoreFormState', handleStateRestore as EventListener);
    };
  }, [form]);

  // Save form state on changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem('businessInfoForm', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Monitor form state changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('Form State Updated:', form.getValues());
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [form.watch()]);

  // Optimized connection monitoring
  useEffect(() => {
    let mounted = true;
    const heartbeat = setInterval(async () => {
      try {
        const response = await fetch('/ping');
        if (mounted && response.ok) {
          setConnectionStatus('connected');
        }
      } catch (error) {
        if (mounted) {
          setConnectionStatus('disconnected');
        }
      }
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(heartbeat);
    };
  }, []);

  const handleSubmit = async (values: BusinessInfoFormData) => {
    try {
      setIsValidating(true);

      // Validation with error grouping
      const validationErrors = Object.entries(values).reduce((acc, [key, value]) => {
        const error = form.formState.errors[key]?.message;
        return error ? { ...acc, [key]: error } : acc;
      }, {});

      if (Object.keys(validationErrors).length > 0) {
        throw new Error('VALIDATION_FAILED');
      }

      await onComplete({
        ...values,
        aiSuggestions,
        validatedAt: new Date().toISOString()
      });

      // Clear saved state after successful submission
      localStorage.removeItem('businessInfoForm');

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

  // Connection status warning with retry button
  if (connectionStatus === 'disconnected') {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        <p className="mb-2">Connection lost. Please retry or refresh the page.</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="text-red-700 border-red-700 hover:bg-red-50"
        >
          Retry Connection
        </Button>
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