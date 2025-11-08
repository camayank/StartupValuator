import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const complianceSchema = z.object({
  industry: z.string().min(1, "Industry is required"),
  region: z.string().min(1, "Region is required"),
  companySize: z.string().min(1, "Company size is required"),
  hasPersonalData: z.boolean().default(false),
  hasFinancialData: z.boolean().default(false),
  operatesInternationally: z.boolean().default(false),
  hasSensitiveData: z.boolean().default(false),
  annualRevenue: z.string().min(1, "Annual revenue is required"),
  fundingStage: z.string().min(1, "Funding stage is required"),
});

type ComplianceFormData = z.infer<typeof complianceSchema>;

export function ComplianceChecker() {
  const [isChecking, setIsChecking] = useState(false);
  const [complianceReport, setComplianceReport] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<ComplianceFormData>({
    resolver: zodResolver(complianceSchema),
    defaultValues: {
      industry: "",
      region: "",
      companySize: "",
      hasPersonalData: false,
      hasFinancialData: false,
      operatesInternationally: false,
      hasSensitiveData: false,
      annualRevenue: "",
      fundingStage: "",
    },
  });

  const onSubmit = async (data: ComplianceFormData) => {
    setIsChecking(true);
    try {
      const response = await fetch("/api/compliance/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to check compliance");
      }

      const report = await response.json();
      setComplianceReport(report);

      toast({
        title: "Success!",
        description: "Compliance check completed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete compliance check. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Compliance & Regulatory Checker</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Complete the form below to receive a comprehensive compliance assessment and regulatory recommendations for your startup.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
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
                        <SelectItem value="fintech">Fintech</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="saas">SaaS</SelectItem>
                        <SelectItem value="ai">AI/ML</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Region of Operation</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="north_america">North America</SelectItem>
                        <SelectItem value="europe">Europe</SelectItem>
                        <SelectItem value="asia_pacific">Asia Pacific</SelectItem>
                        <SelectItem value="latin_america">Latin America</SelectItem>
                        <SelectItem value="africa">Africa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companySize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Size</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-500">201-500 employees</SelectItem>
                        <SelectItem value="500+">500+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="annualRevenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Revenue</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select revenue range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pre-revenue">Pre-revenue</SelectItem>
                        <SelectItem value="0-100k">$0 - $100K</SelectItem>
                        <SelectItem value="100k-1m">$100K - $1M</SelectItem>
                        <SelectItem value="1m-10m">$1M - $10M</SelectItem>
                        <SelectItem value="10m+">$10M+</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="hasPersonalData"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Personal Data Handling</FormLabel>
                      <FormDescription>
                        Does your startup collect or process personal user data?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasFinancialData"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Financial Data Processing</FormLabel>
                      <FormDescription>
                        Do you handle financial transactions or store payment information?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="operatesInternationally"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">International Operations</FormLabel>
                      <FormDescription>
                        Do you operate or serve customers in multiple countries?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isChecking} className="w-full">
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Compliance Requirements...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Check Compliance Status
                </>
              )}
            </Button>
          </form>
        </Form>

        {complianceReport && (
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold">Compliance Report</h3>
            <div className="grid gap-4">
              {Object.entries(complianceReport.requirements).map(([key, requirement]: [string, any]) => (
                <Card key={key}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      {requirement.compliant ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <Info className="h-5 w-5 text-yellow-500 mt-0.5" />
                      )}
                      <div>
                        <h4 className="font-medium">{requirement.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {requirement.description}
                        </p>
                        {!requirement.compliant && (
                          <Alert className="mt-2">
                            <AlertDescription>{requirement.recommendations}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
