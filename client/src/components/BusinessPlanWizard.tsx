import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { 
  FileText, 
  Target, 
  Users, 
  TrendingUp, 
  DollarSign,
  BarChart,
  PieChart 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type BusinessInfo, type ProjectData } from "@/lib/types/shared";

const steps = [
  {
    id: "business_info",
    title: "Business Information",
    icon: FileText,
  },
  {
    id: "market_analysis",
    title: "Market Analysis",
    icon: Target,
  },
  {
    id: "team",
    title: "Team & Operations",
    icon: Users,
  },
  {
    id: "financials",
    title: "Financial Projections",
    icon: TrendingUp,
  },
  {
    id: "metrics",
    title: "Key Metrics",
    icon: BarChart,
  },
  {
    id: "strategy",
    title: "Strategy & Roadmap",
    icon: PieChart,
  },
];

export function BusinessPlanWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [projectData, setProjectData] = useState<Partial<ProjectData>>({});

  const handleStepComplete = (stepData: any) => {
    setProjectData(prev => ({
      ...prev,
      ...stepData
    }));
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Business Plan Generator</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div 
                  key={step.id}
                  className={`flex flex-col items-center gap-2 ${
                    index === currentStep 
                      ? "text-primary" 
                      : index < currentStep 
                      ? "text-muted-foreground" 
                      : "text-muted"
                  }`}
                >
                  <div className={`rounded-full p-2 ${
                    index === currentStep 
                      ? "bg-primary/20" 
                      : "bg-muted"
                  }`}>
                    <StepIcon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium hidden md:block">
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          {/* Add your step components here */}
          {/* Example:
          {currentStep === 0 && (
            <BusinessInfoStep 
              initialData={projectData.businessInfo} 
              onComplete={handleStepComplete} 
            />
          )}
          */}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleStepBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button
            onClick={() => handleStepComplete({})}
            disabled={currentStep === steps.length - 1}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default BusinessPlanWizard;
