import { useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, DollarSign, TrendingUp, LineChart, PieChart } from "lucide-react";
import { financialMetricsSchema } from "@/lib/validations";
import type { ValuationFormData } from "@/lib/validations";
import { currencies } from "@/lib/constants";

interface FinancialDetailsStepProps {
  data: Partial<ValuationFormData>;
  onUpdate: (data: Partial<ValuationFormData>) => void;
  onBack: () => void;
  isLastStep?: boolean;
}

export function FinancialDetailsStep({
  data,
  onUpdate,
  onBack,
  isLastStep = false,
}: FinancialDetailsStepProps) {
  const [activeTab, setActiveTab] = useState("revenue");

  const form = useForm({
    resolver: zodResolver(financialMetricsSchema),
    defaultValues: {
      currency: data.financialData?.currency || "USD",
      revenue: data.financialData?.revenue || 0,
      cac: data.financialData?.cac || 0,
      ltv: data.financialData?.ltv || 0,
      burnRate: data.financialData?.burnRate || 0,
      margins: data.financialData?.margins || 0,
      growthRate: data.financialData?.growthRate || 0,
    },
  });

  const handleSubmit = (values: any) => {
    onUpdate({
      financialData: {
        ...values,
        revenue: Number(values.revenue),
        cac: Number(values.cac),
        ltv: Number(values.ltv),
        burnRate: Number(values.burnRate),
        margins: Number(values.margins),
        growthRate: Number(values.growthRate),
      },
    });
  };

  const currencySymbol = currencies[form.watch("currency") as keyof typeof currencies]?.symbol || "$";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="revenue" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="metrics" className="gap-2">
              <LineChart className="h-4 w-4" />
              Key Metrics
            </TabsTrigger>
            <TabsTrigger value="growth" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Growth
            </TabsTrigger>
            <TabsTrigger value="profitability" className="gap-2">
              <PieChart className="h-4 w-4" />
              Profitability
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Information</CardTitle>
                <CardDescription>
                  Enter your company's revenue details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(currencies).map(([code, { name, symbol }]) => (
                            <SelectItem key={code} value={code}>
                              {symbol} {name}
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
                  name="revenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Revenue</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {currencySymbol}
                          </span>
                          <Input
                            {...field}
                            type="number"
                            className="pl-8"
                            placeholder="Enter annual revenue"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Your company's total annual revenue
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>
                  Enter your key business metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="cac"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <div className="flex items-center gap-2">
                          Customer Acquisition Cost (CAC)
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Average cost to acquire a new customer
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {currencySymbol}
                          </span>
                          <Input
                            {...field}
                            type="number"
                            className="pl-8"
                            placeholder="Enter CAC"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ltv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <div className="flex items-center gap-2">
                          Lifetime Value (LTV)
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Average revenue generated per customer
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {currencySymbol}
                          </span>
                          <Input
                            {...field}
                            type="number"
                            className="pl-8"
                            placeholder="Enter LTV"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="growth" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Growth Metrics</CardTitle>
                <CardDescription>
                  Enter your growth-related metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="growthRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Growth Rate (%)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type="number"
                            placeholder="Enter growth rate"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            %
                          </span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Your year-over-year revenue growth rate
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="burnRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Burn Rate</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {currencySymbol}
                          </span>
                          <Input
                            {...field}
                            type="number"
                            className="pl-8"
                            placeholder="Enter monthly burn rate"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Average monthly cash spent
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profitability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profitability Metrics</CardTitle>
                <CardDescription>
                  Enter your profitability metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="margins"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gross Margin (%)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type="number"
                            placeholder="Enter gross margin"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            %
                          </span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Your gross profit margin percentage
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
          >
            Back
          </Button>
          <Button type="submit">
            {isLastStep ? "Complete" : "Next"}
          </Button>
        </div>
      </form>
    </Form>
  );
}