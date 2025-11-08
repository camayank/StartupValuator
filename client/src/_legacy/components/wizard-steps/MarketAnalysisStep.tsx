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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, Users, TrendingUp, Target } from "lucide-react";
import type { ValuationFormData } from "@/lib/validations";
import { marketAnalysisSchema } from "@/lib/validations";

interface MarketAnalysisStepProps {
  data: Partial<ValuationFormData>;
  onUpdate: (data: Partial<ValuationFormData>) => void;
  onBack: () => void;
  isLastStep?: boolean;
}

export function MarketAnalysisStep({
  data,
  onUpdate,
  onBack,
  isLastStep = false,
}: MarketAnalysisStepProps) {
  const form = useForm({
    resolver: zodResolver(marketAnalysisSchema),
    defaultValues: {
      tam: data.marketData?.tam || 0,
      sam: data.marketData?.sam || 0,
      som: data.marketData?.som || 0,
      marketGrowthRate: data.marketData?.marketGrowthRate || 0,
      competitorCount: data.marketData?.competitorCount || 0,
      marketPosition: data.marketData?.marketPosition || "",
      marketTrends: data.marketData?.marketTrends || "",
      barriers: data.marketData?.barriers || "",
    },
  });

  const handleSubmit = (values: any) => {
    onUpdate({
      marketData: {
        ...values,
        tam: Number(values.tam),
        sam: Number(values.sam),
        som: Number(values.som),
        marketGrowthRate: Number(values.marketGrowthRate),
        competitorCount: Number(values.competitorCount),
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Market Size Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Market Size
              </CardTitle>
              <CardDescription>
                Define your total addressable market and segments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="tam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Total Addressable Market (TAM)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            The total market demand for your product/service
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="Enter TAM value"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Serviceable Addressable Market (SAM)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            The portion of TAM you can realistically target
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="Enter SAM value"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="som"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Serviceable Obtainable Market (SOM)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            The portion of SAM you can capture
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="Enter SOM value"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Market Dynamics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Market Dynamics
              </CardTitle>
              <CardDescription>
                Analyze market growth and competition
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="marketGrowthRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market Growth Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="Enter market growth rate"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="competitorCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Major Competitors</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="Enter competitor count"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market Position</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your market position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="leader">Market Leader</SelectItem>
                        <SelectItem value="challenger">Challenger</SelectItem>
                        <SelectItem value="follower">Follower</SelectItem>
                        <SelectItem value="niche">Niche Player</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Market Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Market Analysis
            </CardTitle>
            <CardDescription>
              Describe market trends and entry barriers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="marketTrends"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Market Trends</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe the key trends in your market..."
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="barriers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entry Barriers</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe the main barriers to entry..."
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

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
