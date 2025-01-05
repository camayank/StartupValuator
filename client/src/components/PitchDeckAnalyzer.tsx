import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  FileText,
  ChevronRight,
  ChevronLeft,
  Upload,
  Star,
  TrendingUp,
  Target,
  MessageSquare,
  BarChart4,
} from "lucide-react";

interface PitchDeckSlide {
  slideNumber: number;
  content: string;
  type: string;
}

interface PitchDeckAnalysis {
  overallScore: number;
  sections: {
    name: string;
    score: number;
    feedback: string;
    suggestions: string[];
  }[];
  keyStrengths: string[];
  improvementAreas: string[];
  marketAnalysis: string;
  competitiveAdvantage: string;
  presentationStyle: string;
}

export function PitchDeckAnalyzer() {
  const [slides, setSlides] = useState<PitchDeckSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { toast } = useToast();

  const { mutate: analyzeSlides, data: analysis } = useMutation({
    mutationFn: async (slides: PitchDeckSlide[]) => {
      const response = await fetch("/api/analyze-pitch-deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze pitch deck");
      }

      return response.json() as Promise<PitchDeckAnalysis>;
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to analyze pitch deck. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const newSlides: PitchDeckSlide[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const text = await file.text();
      newSlides.push({
        slideNumber: i + 1,
        content: text,
        type: file.type,
      });
    }

    setSlides(newSlides);
    setCurrentSlide(0);
  };

  const handleAnalyze = () => {
    if (slides.length === 0) {
      toast({
        title: "Error",
        description: "Please upload your pitch deck slides first.",
        variant: "destructive",
      });
      return;
    }

    analyzeSlides(slides);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Pitch Deck Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-center">
              <Button variant="outline" className="w-full max-w-md" onClick={() => document.getElementById('slideUpload')?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Pitch Deck Slides
              </Button>
              <input
                id="slideUpload"
                type="file"
                multiple
                accept=".txt,.md"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {slides.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                    disabled={currentSlide === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm">
                    Slide {currentSlide + 1} of {slides.length}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
                    disabled={currentSlide === slides.length - 1}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <pre className="whitespace-pre-wrap text-sm">
                      {slides[currentSlide].content}
                    </pre>
                  </CardContent>
                </Card>

                <Button className="w-full" onClick={handleAnalyze}>
                  <BarChart4 className="w-4 h-4 mr-2" />
                  Analyze Pitch Deck
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Analysis Results
                <Badge variant={analysis.overallScore >= 80 ? "default" : "secondary"}>
                  Score: {analysis.overallScore}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {analysis.sections.map((section, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{section.name}</h4>
                    <span className="text-sm">{section.score}%</span>
                  </div>
                  <Progress value={section.score} className="h-2" />
                  <p className="text-sm text-muted-foreground">{section.feedback}</p>
                  <ul className="space-y-1">
                    {section.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4" />
                    Key Strengths
                  </h4>
                  <ul className="space-y-2">
                    {analysis.keyStrengths.map((strength, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4" />
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-2">
                    {analysis.improvementAreas.map((area, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    Market Analysis
                  </h4>
                  <p className="text-sm text-muted-foreground">{analysis.marketAnalysis}</p>
                </div>

                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4" />
                    Competitive Advantage
                  </h4>
                  <p className="text-sm text-muted-foreground">{analysis.competitiveAdvantage}</p>
                </div>

                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4" />
                    Presentation Style
                  </h4>
                  <p className="text-sm text-muted-foreground">{analysis.presentationStyle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
