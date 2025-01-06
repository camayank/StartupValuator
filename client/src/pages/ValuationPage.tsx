import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Building2, LineChart, Calculator, Shield, BookOpen } from "lucide-react";

const STEPS = [
  { id: 'company', title: 'Company Info', icon: Building2 },
  { id: 'financials', title: 'Financial Data', icon: LineChart },
  { id: 'projections', title: 'Projections', icon: Calculator },
  { id: 'risk', title: 'Risk Analysis', icon: Shield },
  { id: 'review', title: 'Review', icon: BookOpen }
];

export default function ValuationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Business Valuation</h1>
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {STEPS.length}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <TabsList className="grid grid-cols-5 gap-4">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <TabsTrigger
                    key={step.id}
                    value={step.id}
                    disabled={index > currentStep}
                    className={`flex flex-col items-center p-4 ${
                      index === currentStep ? 'border-primary' : ''
                    }`}
                    onClick={() => index <= currentStep && setCurrentStep(index)}
                  >
                    <Icon className="h-6 w-6 mb-2" />
                    <span className="text-sm">{step.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <Tabs value={STEPS[currentStep].id} className="mt-8">
            {/* Step content will be added here */}
            <TabsContent value="company">
              Company Info Form
            </TabsContent>
            <TabsContent value="financials">
              Financial Data Form
            </TabsContent>
            <TabsContent value="projections">
              Projections Form
            </TabsContent>
            <TabsContent value="risk">
              Risk Analysis Form
            </TabsContent>
            <TabsContent value="review">
              Final Review
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentStep === STEPS.length - 1}
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
