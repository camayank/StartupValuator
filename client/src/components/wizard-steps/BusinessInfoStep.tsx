import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatCurrency, parseCurrencyInput, getCurrencySymbol, formatINRShort, cn } from "@/lib/utils";
import { validateCIN, validateGST, validatePAN, VALIDATION_MESSAGES } from "@/lib/validators";
import { INDIAN_SECTORS, FUNDING_STAGES } from "@/lib/constants";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { ChevronDown, Building2 } from "lucide-react";
import useForceUpdate from "@/hooks/use-force-update";

const businessInfoSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  fundingStage: z.string().optional(),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).default('INR'),
  revenueModel: z.string().default('SaaS'),
  annualRevenue: z.number().min(0, "Revenue cannot be negative"),
  employeeCount: z.number().min(0, "Employee count cannot be negative"),

  // Indian compliance fields (optional)
  cin: z.string().optional().refine(
    (val) => !val || validateCIN(val),
    { message: VALIDATION_MESSAGES.CIN }
  ),
  gstNumber: z.string().optional().refine(
    (val) => !val || validateGST(val),
    { message: VALIDATION_MESSAGES.GST }
  ),
  panNumber: z.string().optional().refine(
    (val) => !val || validatePAN(val),
    { message: VALIDATION_MESSAGES.PAN }
  ),
  dpiitRecognitionNumber: z.string().optional(),
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
  const [showIndianCompliance, setShowIndianCompliance] = useState(false);

  // Use force update hook with optimized interval
  useForceUpdate(2000);

  const form = useForm<BusinessInfoFormData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      companyName: sessionData.companyName || '',
      industry: sessionData.industry || '',
      fundingStage: sessionData.fundingStage || '',
      currency: sessionData.currency || 'INR',
      revenueModel: sessionData.revenueModel || 'SaaS',
      annualRevenue: sessionData.annualRevenue || 0,
      employeeCount: sessionData.employeeCount || 0,
      cin: sessionData.cin || '',
      gstNumber: sessionData.gstNumber || '',
      panNumber: sessionData.panNumber || '',
      dpiitRecognitionNumber: sessionData.dpiitRecognitionNumber || '',
    }
  });

  // Auto-detect if we should show Indian compliance fields
  useEffect(() => {
    const currency = form.watch('currency');
    if (currency === 'INR') {
      setShowIndianCompliance(true);
    }
  }, [form.watch('currency')]);

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
        // Show specific field errors
        const errorList = Object.entries(form.formState.errors)
          .map(([field, error]) => `• ${field}: ${error?.message}`)
          .join('\n');

        toast({
          title: "Please complete the following fields:",
          description: errorList,
          variant: "destructive",
          duration: 5000
        });

        // Scroll to first error
        const firstErrorField = document.querySelector('[aria-invalid="true"]');
        firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });

        throw new Error('VALIDATION_FAILED');
      }

      // Sanity checks for data quality
      if (values.fundingStage && values.annualRevenue >= 0 && values.employeeCount >= 0) {
        const sanityWarnings: string[] = [];

        // Check if values seem unrealistic for the stage
        if (values.fundingStage === 'pre_seed' && values.annualRevenue > 10000000) {
          sanityWarnings.push(`Revenue of ${formatINRShort(values.annualRevenue)} is very high for Pre-seed (typical max: ₹1Cr)`);
        }
        if (values.fundingStage === 'seed' && values.annualRevenue > 50000000) {
          sanityWarnings.push(`Revenue of ${formatINRShort(values.annualRevenue)} is very high for Seed (typical max: ₹5Cr)`);
        }

        if (sanityWarnings.length > 0) {
          toast({
            title: "⚠️ Data Quality Check",
            description: sanityWarnings.join('\n'),
            duration: 8000
          });
        }
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
      if (error.message !== 'VALIDATION_FAILED') {
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
      }
    } finally {
      setIsValidating(false);
    }
  };

  // Get currency-appropriate revenue display
  const selectedCurrency = form.watch('currency');
  const annualRevenue = form.watch('annualRevenue');
  const revenueDisplay = selectedCurrency === 'INR' && annualRevenue > 0
    ? formatINRShort(annualRevenue)
    : '';

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
            {/* Company Name */}
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Company Name
                    <InfoTooltip
                      content="The legal or operating name of your startup"
                      example="Acme Tech Solutions Pvt Ltd"
                    />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter your company name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Currency Selection */}
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Reporting Currency
                    <InfoTooltip
                      content="The primary currency for your financial reports and valuations"
                    />
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INR">🇮🇳 Indian Rupee (₹)</SelectItem>
                      <SelectItem value="USD">🇺🇸 US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">🇪🇺 Euro (€)</SelectItem>
                      <SelectItem value="GBP">🇬🇧 British Pound (£)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Industry Selection */}
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Industry / Sector
                    <InfoTooltip
                      content="Select the primary industry your startup operates in"
                    />
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px]">
                      {INDIAN_SECTORS.map(sector => (
                        <SelectItem key={sector.value} value={sector.value}>
                          <div className="flex items-center gap-2">
                            <span>{sector.icon}</span>
                            <span>{sector.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Funding Stage */}
            <FormField
              control={form.control}
              name="fundingStage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Current Funding Stage
                    <InfoTooltip
                      content="Your current fundraising stage helps determine appropriate valuation methods"
                    />
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select funding stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FUNDING_STAGES.map(stage => (
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

            {/* Annual Revenue and Employee Count */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="annualRevenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      Annual Revenue
                      <InfoTooltip
                        content="Your total revenue for the last 12 months (or Annual Recurring Revenue for SaaS)"
                        example={selectedCurrency === 'INR' ? '₹1.5Cr (₹1,50,00,000)' : '$500,000'}
                      />
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          {getCurrencySymbol(selectedCurrency)}
                        </span>
                        <Input
                          {...field}
                          type="text"
                          value={formatCurrency(field.value, selectedCurrency)}
                          onChange={(e) => {
                            const value = parseCurrencyInput(e.target.value);
                            field.onChange(value);
                          }}
                          className="pl-8"
                          placeholder="0.00"
                        />
                      </div>
                    </FormControl>
                    {revenueDisplay && (
                      <FormDescription>
                        {revenueDisplay}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employeeCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      Number of Employees
                      <InfoTooltip
                        content="Total full-time employees including founders"
                      />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                        min={0}
                        placeholder="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Indian Compliance Fields (Collapsible) */}
            <Collapsible open={showIndianCompliance} onOpenChange={setShowIndianCompliance}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-between"
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>Indian Compliance Details</span>
                    {selectedCurrency === 'INR' && (
                      <span className="text-xs text-muted-foreground">(Optional but recommended)</span>
                    )}
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      showIndianCompliance && "rotate-180"
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4 pt-4 border-t">
                {/* CIN */}
                <FormField
                  control={form.control}
                  name="cin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        CIN (Corporate Identification Number)
                        <InfoTooltip
                          content="21-character unique identifier assigned to companies registered in India"
                          example="U72900KA2015PTC123456"
                        />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="U72900KA2015PTC123456"
                          maxLength={21}
                          className="uppercase"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        21 characters: [Type][Industry][State][Year][Entity][Number]
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* GST Number */}
                <FormField
                  control={form.control}
                  name="gstNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        GST Number
                        <InfoTooltip
                          content="15-digit Goods and Services Tax Identification Number"
                          example="22AAAAA0000A1Z5"
                        />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="22AAAAA0000A1Z5"
                          maxLength={15}
                          className="uppercase"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        15 characters: [State(2)][PAN(10)][Entity][Z][Check]
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* PAN Number */}
                <FormField
                  control={form.control}
                  name="panNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        PAN Number
                        <InfoTooltip
                          content="10-character Permanent Account Number"
                          example="AAAAA9999A"
                        />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="AAAAA9999A"
                          maxLength={10}
                          className="uppercase"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        10 characters: [Letters(5)][Numbers(4)][Letter(1)]
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* DPIIT Recognition */}
                <FormField
                  control={form.control}
                  name="dpiitRecognitionNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        DPIIT Recognition Number
                        <InfoTooltip
                          content="Department for Promotion of Industry and Internal Trade (DPIIT) recognition number for eligible startups"
                          example="DIPP12345"
                        />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="DIPP12345"
                          className="uppercase"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Provides tax benefits and access to government schemes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CollapsibleContent>
            </Collapsible>

            {/* Submit Button */}
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
