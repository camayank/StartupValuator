import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BusinessInfoStep } from "@/components/wizard-steps/BusinessInfoStep";
import { MethodSelectionStep } from "@/components/wizard-steps/MethodSelectionStep";
import { ReviewStep } from "@/components/wizard-steps/ReviewStep";
import { Brain, Sparkles, Calculator, FileText } from "lucide-react";
import { motion } from "framer-motion";
import type { ValuationFormData } from "@/lib/validations";

const STEPS = [
  { id: 'business-info', title: 'Business Information' },
  { id: 'method-selection', title: 'Valuation Method' },
  { id: 'review', title: 'Review & Generate' }
];

const FEATURE_CARDS = [
  {
    title: "AI-Powered Analysis",
    description: "Intelligent valuation powered by advanced machine learning algorithms",
    icon: Brain,
    color: "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20",
    gradient: "from-blue-500/20 to-blue-500/5",
  },
  {
    title: "Smart Predictions",
    description: "Data-driven growth and market potential predictions",
    icon: Sparkles,
    color: "bg-purple-500/10 text-purple-500 dark:bg-purple-500/20",
    gradient: "from-purple-500/20 to-purple-500/5",
  },
  {
    title: "Multi-Method Valuation",
    description: "Comprehensive analysis using multiple valuation approaches",
    icon: Calculator,
    color: "bg-green-500/10 text-green-500 dark:bg-green-500/20",
    gradient: "from-green-500/20 to-green-500/5",
  },
  {
    title: "Detailed Reports",
    description: "Generate in-depth valuation reports with insights",
    icon: FileText,
    color: "bg-orange-500/10 text-orange-500 dark:bg-orange-500/20",
    gradient: "from-orange-500/20 to-orange-500/5",
  },
];

export default function ValuationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<ValuationFormData>>({});

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleUpdate = (data: Partial<ValuationFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleSubmit = (data: ValuationFormData) => {
    // Handle final submission
    console.log('Final form data:', data);
  };

  return (
    <div className="min-h-screen bg-background/50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURE_CARDS.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="h-full border-none shadow-md bg-gradient-to-br hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`p-3 rounded-full ${feature.color} bg-gradient-to-br ${feature.gradient}`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Valuation Wizard */}
        <Card className="max-w-4xl mx-auto border shadow-lg bg-card">
          <CardHeader className="border-b bg-muted/50">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Smart Valuation
              </h1>
              <div className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {STEPS.length}
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>
          <CardContent className="p-6">
            {currentStep === 0 && (
              <BusinessInfoStep
                data={formData}
                onUpdate={handleUpdate}
                onNext={handleNext}
                currentStep={currentStep + 1}
                totalSteps={STEPS.length}
              />
            )}
            {currentStep === 1 && (
              <MethodSelectionStep
                data={formData}
                onUpdate={handleUpdate}
                onNext={handleNext}
                onBack={handleBack}
                currentStep={currentStep + 1}
                totalSteps={STEPS.length}
              />
            )}
            {currentStep === 2 && (
              <ReviewStep
                data={formData}
                onUpdate={handleUpdate}
                onSubmit={handleSubmit}
                onBack={handleBack}
                currentStep={currentStep + 1}
                totalSteps={STEPS.length}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}