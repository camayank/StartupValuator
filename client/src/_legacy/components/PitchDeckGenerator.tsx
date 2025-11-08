import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { pitchDeckFormSchema, type PitchDeckFormData } from "@/lib/validations";
import type { ValuationFormData } from "@/lib/validations";

interface PitchDeckGeneratorProps {
  valuationData?: ValuationFormData;
  isPremium?: boolean;
}

export function PitchDeckGenerator({ valuationData, isPremium = false }: PitchDeckGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<PitchDeckFormData>({
    resolver: zodResolver(pitchDeckFormSchema),
    defaultValues: {
      companyName: valuationData?.businessInfo?.companyName || "",
      tagline: "",
      problem: valuationData?.businessInfo?.problemSolved || "",
      solution: valuationData?.businessInfo?.solution || "",
      marketSize: valuationData?.businessInfo?.marketSize?.toString() || "",
      businessModel: valuationData?.businessInfo?.businessModel || "",
      competition: valuationData?.businessInfo?.competition || "",
      traction: valuationData?.businessInfo?.traction || "",
      team: valuationData?.businessInfo?.team || "",
      financials: `Revenue: ${valuationData?.financialData?.revenue || 0}\nBurn Rate: ${valuationData?.financialData?.burnRate || 0}\nRunway: ${valuationData?.financialData?.runway || 0} months`,
      fundingAsk: valuationData?.financialData?.fundingNeeded?.toString() || "",
      useOfFunds: "",
      presentationStyle: "professional",
      colorScheme: "blue",
      additionalNotes: "",
    },
  });

  const onSubmit = async (data: PitchDeckFormData) => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "AI-enhanced pitch deck generation is a premium feature. Please upgrade your plan to access this feature.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Get AI-powered suggestions first
      const suggestionsResponse = await fetch("/api/pitch-deck/personalize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          valuationData, // Include valuation data for better context
        }),
      });

      if (!suggestionsResponse.ok) {
        throw new Error("Failed to get AI suggestions");
      }

      const suggestions = await suggestionsResponse.json();
      setAiSuggestions(suggestions);

      // Get industry-specific analysis
      const analysisResponse = await fetch("/api/pitch-deck/industry-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          industry: valuationData?.businessInfo?.sector || data.marketSize,
          businessModel: data.businessModel,
          valuationMetrics: valuationData?.financialData,
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error("Failed to get industry analysis");
      }

      const analysis = await analysisResponse.json();

      // Generate the final pitch deck with AI enhancements
      const response = await fetch("/api/pitch-deck/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          aiSuggestions: suggestions,
          industryAnalysis: analysis,
          valuationInsights: {
            monteCarlo: valuationData?.monteCarloSimulation,
            riskAssessment: valuationData?.risksAndOpportunities,
            marketValidation: valuationData?.marketValidation,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate pitch deck");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pitch-deck.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success!",
        description: "Your AI-enhanced pitch deck has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate pitch deck",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>AI-Enhanced Pitch Deck Generator {!isPremium && <span className="text-sm text-muted-foreground ml-2">(Premium)</span>}</CardTitle>
        <CardDescription>
          Generate a professional investor pitch deck with AI-powered personalization using your valuation data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isPremium && (
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              This is a premium feature. Upgrade your plan to access AI-enhanced pitch deck generation with personalized insights and industry analysis.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
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
                name="tagline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tagline</FormLabel>
                    <FormDescription>A brief, catchy description of your company</FormDescription>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="problem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Problem</FormLabel>
                  <FormDescription>What problem are you solving?</FormDescription>
                  <FormControl>
                    <Textarea {...field} className="min-h-[100px]" />
                  </FormControl>
                  <FormMessage />
                  {aiSuggestions?.problemRefinement && (
                    <Alert className="mt-2">
                      <Info className="h-4 w-4" />
                      <AlertDescription>{aiSuggestions.problemRefinement}</AlertDescription>
                    </Alert>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="solution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Solution</FormLabel>
                  <FormDescription>How does your product/service solve this problem?</FormDescription>
                  <FormControl>
                    <Textarea {...field} className="min-h-[100px]" />
                  </FormControl>
                  <FormMessage />
                  {aiSuggestions?.solutionEnhancement && (
                    <Alert className="mt-2">
                      <Info className="h-4 w-4" />
                      <AlertDescription>{aiSuggestions.solutionEnhancement}</AlertDescription>
                    </Alert>
                  )}
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="marketSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market Size</FormLabel>
                    <FormDescription>TAM, SAM, and SOM figures</FormDescription>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    {aiSuggestions?.marketInsights && (
                      <Alert className="mt-2">
                        <Info className="h-4 w-4" />
                        <AlertDescription>{aiSuggestions.marketInsights}</AlertDescription>
                      </Alert>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fundingAsk"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Funding Ask</FormLabel>
                    <FormDescription>How much are you raising?</FormDescription>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    {aiSuggestions?.fundingStrategy && (
                      <Alert className="mt-2">
                        <Info className="h-4 w-4" />
                        <AlertDescription>{aiSuggestions.fundingStrategy}</AlertDescription>
                      </Alert>
                    )}
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="businessModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Model</FormLabel>
                  <FormDescription>How do you make money?</FormDescription>
                  <FormControl>
                    <Textarea {...field} className="min-h-[100px]" />
                  </FormControl>
                  <FormMessage />
                  {aiSuggestions?.businessModelOptimization && (
                    <Alert className="mt-2">
                      <Info className="h-4 w-4" />
                      <AlertDescription>{aiSuggestions.businessModelOptimization}</AlertDescription>
                    </Alert>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="competition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Competition</FormLabel>
                  <FormDescription>Who are your competitors and what's your advantage?</FormDescription>
                  <FormControl>
                    <Textarea {...field} className="min-h-[100px]" />
                  </FormControl>
                  <FormMessage />
                  {aiSuggestions?.competitiveAdvantage && (
                    <Alert className="mt-2">
                      <Info className="h-4 w-4" />
                      <AlertDescription>{aiSuggestions.competitiveAdvantage}</AlertDescription>
                    </Alert>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="traction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Traction</FormLabel>
                  <FormDescription>Key metrics, milestones, and achievements</FormDescription>
                  <FormControl>
                    <Textarea {...field} className="min-h-[100px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="team"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team</FormLabel>
                  <FormDescription>Key team members and their backgrounds</FormDescription>
                  <FormControl>
                    <Textarea {...field} className="min-h-[100px]" />
                  </FormControl>
                  <FormMessage />
                  {aiSuggestions?.teamPresentation && (
                    <Alert className="mt-2">
                      <Info className="h-4 w-4" />
                      <AlertDescription>{aiSuggestions.teamPresentation}</AlertDescription>
                    </Alert>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="financials"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Financials</FormLabel>
                  <FormDescription>Key financial metrics and projections</FormDescription>
                  <FormControl>
                    <Textarea {...field} className="min-h-[100px]" />
                  </FormControl>
                  <FormMessage />
                  {aiSuggestions?.financialNarrative && (
                    <Alert className="mt-2">
                      <Info className="h-4 w-4" />
                      <AlertDescription>{aiSuggestions.financialNarrative}</AlertDescription>
                    </Alert>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="useOfFunds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Use of Funds</FormLabel>
                  <FormDescription>How will you use the investment?</FormDescription>
                  <FormControl>
                    <Textarea {...field} className="min-h-[100px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="presentationStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presentation Style</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="colorScheme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color Scheme</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select color scheme" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormDescription>Any other information you'd like to include</FormDescription>
                  <FormControl>
                    <Textarea {...field} className="min-h-[100px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isGenerating || !isPremium} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating AI-Enhanced Pitch Deck...
                </>
              ) : (
                "Generate AI-Enhanced Pitch Deck"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}