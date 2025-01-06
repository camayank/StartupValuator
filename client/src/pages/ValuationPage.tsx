import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLocation } from "wouter";
import type { ValuationFormData } from "@/lib/validations";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { valuationFormSchema, sectors, businessStages } from "@/lib/validations";
import { calculateIndustryAdjustedValuation } from "@/lib/financialModels";

export default function ValuationPage() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1] || '');
  const selectedSector = params.get('sector');

  const form = useForm<ValuationFormData>({
    resolver: zodResolver(valuationFormSchema),
    defaultValues: {
      sector: selectedSector as keyof typeof sectors || "technology",
      subsector: Object.keys(sectors[selectedSector as keyof typeof sectors]?.subsectors || {})[0],
      currency: "USD",
      stage: "early_revenue",
      region: "us",
      businessName: "",
      revenue: 0,
      growthRate: 0,
      margins: 0,
      totalAddressableMarket: 0,
      marketShare: 0,
      competitors: []
    }
  });

  const [report, setReport] = useState<{
    value: number;
    details: {
      baseValue: number;
      industryMultiple: number;
      adjustments: Record<string, number>;
      metrics: Record<string, number>;
    };
  } | null>(null);

  const onSubmit = async (data: ValuationFormData) => {
    try {
      const valuation = calculateIndustryAdjustedValuation(data);
      setReport(valuation);
    } catch (error) {
      console.error('Valuation calculation error:', error);
    }
  };

  const sector = sectors[form.watch('sector')];
  const subsector = sector?.subsectors[form.watch('subsector') as keyof typeof sector.subsectors];

  return (
    <div className="min-h-screen bg-background/50">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="border-b bg-muted/50">
            <h1 className="text-2xl font-bold">
              {sector?.name} Valuation
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your business details to generate a comprehensive valuation report
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="grid gap-4 md:grid-cols-2">
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
                    name="stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Stage</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(businessStages).map(([key, stage]) => (
                              <SelectItem key={key} value={key}>
                                {stage.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Financial Metrics */}
                <div className="grid gap-4 md:grid-cols-2">
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
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Industry-specific Metrics */}
                {subsector?.metrics && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Industry Metrics</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {subsector.metrics.map((metric) => (
                        <FormField
                          key={metric}
                          control={form.control}
                          name={`industryMetrics.${form.watch('sector')}.${metric}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{metric.toUpperCase()}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={e => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full">
                  Generate Valuation Report
                </Button>
              </form>
            </Form>

            {report && (
              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold">Valuation Report</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">Valuation</div>
                      <div className="text-2xl font-bold">
                        ${report.value.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">Industry Multiple</div>
                      <div className="text-2xl font-bold">
                        {report.details.industryMultiple.toFixed(2)}x
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Key Metrics</h3>
                  {Object.entries(report.details.metrics).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {key.split('_').join(' ').toUpperCase()}
                      </span>
                      <span>{typeof value === 'number' ? value.toFixed(2) : value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}