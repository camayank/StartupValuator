import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Info, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { MethodRecommendation } from "../../../server/lib/methodRecommender";
import type { ValuationFormData } from "@/lib/validations";

interface MethodSelectionWizardProps {
  data: ValuationFormData;
  recommendation: {
    primaryMethod: MethodRecommendation;
    alternativeMethods: MethodRecommendation[];
    dataQualityScore: number;
    suggestions: string[];
  };
  onMethodSelect: (method: 'dcf' | 'comparables' | 'hybrid') => void;
}

export function MethodSelectionWizard({
  data,
  recommendation,
  onMethodSelect,
}: MethodSelectionWizardProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>(
    recommendation.primaryMethod.method
  );
  const [step, setStep] = useState(1);

  const allMethods = [recommendation.primaryMethod, ...recommendation.alternativeMethods];
  const currentMethod = allMethods.find(m => m.method === selectedMethod);

  const getMethodColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getDataQualityColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Valuation Method Selection
          <Badge variant="outline">
            Step {step} of 3
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Data Quality Assessment</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Progress
                      value={recommendation.dataQualityScore}
                      className={`h-2 ${getDataQualityColor(recommendation.dataQualityScore)}`}
                    />
                    <span className="text-sm font-medium">
                      {recommendation.dataQualityScore}%
                    </span>
                  </div>
                </div>

                {recommendation.suggestions.length > 0 && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">
                          Suggestions for Improvement
                        </h4>
                        <ul className="mt-2 text-sm text-yellow-700">
                          {recommendation.suggestions.map((suggestion, index) => (
                            <li key={index} className="mt-1">• {suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full mt-4"
                  onClick={() => setStep(2)}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Recommended Methods</h3>
                
                <Select
                  value={selectedMethod}
                  onValueChange={setSelectedMethod}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select valuation method" />
                  </SelectTrigger>
                  <SelectContent>
                    {allMethods.map((method) => (
                      <SelectItem key={method.method} value={method.method}>
                        <div className="flex items-center justify-between w-full">
                          <span className="capitalize">
                            {method.method === 'dcf' ? 'DCF Analysis' : 
                             method.method === 'comparables' ? 'Market Comparables' :
                             'Hybrid Approach'}
                          </span>
                          <span className={getMethodColor(method.confidence)}>
                            {method.confidence}% Match
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {currentMethod && (
                  <div className="mt-4 space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                      <div className="flex">
                        <Info className="h-5 w-5 text-blue-400 mr-2" />
                        <p className="text-sm text-blue-700">{currentMethod.reasoning}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Advantages
                        </h4>
                        <ul className="space-y-1">
                          {currentMethod.pros.map((pro, index) => (
                            <li key={index} className="text-sm text-gray-600">• {pro}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          Limitations
                        </h4>
                        <ul className="space-y-1">
                          {currentMethod.cons.map((con, index) => (
                            <li key={index} className="text-sm text-gray-600">• {con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full mt-4"
                  onClick={() => setStep(3)}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Method Requirements</h3>

                {currentMethod && (
                  <>
                    <div className="space-y-2">
                      <h4 className="font-medium">Required Data Points:</h4>
                      <ul className="space-y-2">
                        {currentMethod.requirements.map((req, index) => (
                          <li
                            key={index}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6">
                      <Button
                        className="w-full"
                        onClick={() => onMethodSelect(currentMethod.method)}
                      >
                        Confirm Selection
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
