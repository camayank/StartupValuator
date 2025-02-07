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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, X, Target, ShieldCheck, Users } from "lucide-react";
import type { ValuationFormData } from "@/lib/validations";
import { competitiveAnalysisSchema } from "@/lib/validations";

interface CompetitiveAnalysisStepProps {
  data: Partial<ValuationFormData>;
  onUpdate: (data: Partial<ValuationFormData>) => void;
  onBack: () => void;
  isLastStep?: boolean;
}

interface Competitor {
  name: string;
  marketShare: number;
  strengths: string;
  weaknesses: string;
}

export function CompetitiveAnalysisStep({
  data,
  onUpdate,
  onBack,
  isLastStep = false,
}: CompetitiveAnalysisStepProps) {
  const [competitors, setCompetitors] = useState<Competitor[]>(
    data.marketData?.competitors || []
  );
  const [newCompetitor, setNewCompetitor] = useState<Partial<Competitor>>({});

  const form = useForm({
    resolver: zodResolver(competitiveAnalysisSchema),
    defaultValues: {
      competitiveAdvantages: data.marketData?.competitiveAdvantages || "",
      differentiators: data.marketData?.differentiators || "",
      marketStrategy: data.marketData?.marketStrategy || "",
    },
  });

  const addCompetitor = () => {
    if (newCompetitor.name && newCompetitor.marketShare) {
      setCompetitors([
        ...competitors,
        {
          name: newCompetitor.name,
          marketShare: Number(newCompetitor.marketShare),
          strengths: newCompetitor.strengths || "",
          weaknesses: newCompetitor.weaknesses || "",
        },
      ]);
      setNewCompetitor({});
    }
  };

  const removeCompetitor = (index: number) => {
    setCompetitors(competitors.filter((_, i) => i !== index));
  };

  const handleSubmit = (values: any) => {
    onUpdate({
      marketData: {
        ...data.marketData,
        ...values,
        competitors,
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Competitor Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Competitor Analysis
            </CardTitle>
            <CardDescription>
              Add and analyze your main competitors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Input
                  placeholder="Competitor name"
                  value={newCompetitor.name || ""}
                  onChange={(e) =>
                    setNewCompetitor({ ...newCompetitor, name: e.target.value })
                  }
                />
                <Input
                  type="number"
                  placeholder="Market share (%)"
                  value={newCompetitor.marketShare || ""}
                  onChange={(e) =>
                    setNewCompetitor({
                      ...newCompetitor,
                      marketShare: Number(e.target.value),
                    })
                  }
                />
                <Textarea
                  placeholder="Key strengths"
                  value={newCompetitor.strengths || ""}
                  onChange={(e) =>
                    setNewCompetitor({
                      ...newCompetitor,
                      strengths: e.target.value,
                    })
                  }
                />
                <Textarea
                  placeholder="Key weaknesses"
                  value={newCompetitor.weaknesses || ""}
                  onChange={(e) =>
                    setNewCompetitor({
                      ...newCompetitor,
                      weaknesses: e.target.value,
                    })
                  }
                />
              </div>
              <Button
                type="button"
                onClick={addCompetitor}
                className="w-full"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Competitor
              </Button>

              {competitors.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Competitor</TableHead>
                      <TableHead>Market Share</TableHead>
                      <TableHead>Strengths</TableHead>
                      <TableHead>Weaknesses</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {competitors.map((competitor, index) => (
                      <TableRow key={index}>
                        <TableCell>{competitor.name}</TableCell>
                        <TableCell>{competitor.marketShare}%</TableCell>
                        <TableCell>{competitor.strengths}</TableCell>
                        <TableCell>{competitor.weaknesses}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCompetitor(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Competitive Advantages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Competitive Advantages
            </CardTitle>
            <CardDescription>
              Define your competitive positioning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="competitiveAdvantages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Competitive Advantages</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your main competitive advantages..."
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="differentiators"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Differentiators</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="What makes your solution unique..."
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Market Strategy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Market Strategy
            </CardTitle>
            <CardDescription>
              Define your go-to-market strategy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="marketStrategy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Go-to-Market Strategy</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your market entry and growth strategy..."
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
