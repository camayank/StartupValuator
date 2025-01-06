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
import { Info, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const pitchDeckSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  tagline: z.string().min(1, "Tagline is required"),
  problem: z.string().min(10, "Problem statement should be detailed"),
  solution: z.string().min(10, "Solution description should be detailed"),
  marketSize: z.string().min(1, "Market size is required"),
  businessModel: z.string().min(10, "Business model should be detailed"),
  competition: z.string().min(10, "Competitive analysis should be detailed"),
  traction: z.string().optional(),
  team: z.string().min(10, "Team description should be detailed"),
  financials: z.string().min(10, "Financial overview should be detailed"),
  fundingAsk: z.string().min(1, "Funding ask is required"),
  useOfFunds: z.string().min(10, "Use of funds should be detailed"),
});

type PitchDeckFormData = z.infer<typeof pitchDeckSchema>;

export function PitchDeckGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const form = useForm<PitchDeckFormData>({
    resolver: zodResolver(pitchDeckSchema),
    defaultValues: {
      companyName: "",
      tagline: "",
      problem: "",
      solution: "",
      marketSize: "",
      businessModel: "",
      competition: "",
      traction: "",
      team: "",
      financials: "",
      fundingAsk: "",
      useOfFunds: "",
    },
  });

  const onSubmit = async (data: PitchDeckFormData) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/pitch-deck/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
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
        description: "Your pitch deck has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate pitch deck. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Pitch Deck Generator</CardTitle>
        <CardDescription>
          Generate a professional investor pitch deck in one click
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Fill in the details below to generate your pitch deck. The more detailed your inputs, the better the output will be.
          </AlertDescription>
        </Alert>

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

            <Button type="submit" disabled={isGenerating} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Pitch Deck...
                </>
              ) : (
                "Generate Pitch Deck"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
