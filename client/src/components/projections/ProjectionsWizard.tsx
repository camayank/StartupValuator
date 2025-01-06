import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueProjectionsStep } from "./RevenueProjectionsStep";
import { ExpensesProjectionsStep } from "./ExpensesProjectionsStep";
import { FundUtilizationStep } from "./FundUtilizationStep";
import { ProjectionsReviewStep } from "./ProjectionsReviewStep";
import type { FinancialProjectionData } from "@/lib/validations";
import { motion, AnimatePresence } from "framer-motion";

const steps = ["Revenue", "Expenses", "Fund Utilization", "Review"] as const;

export function ProjectionsWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Partial<FinancialProjectionData>>({});

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleUpdate = (newData: Partial<FinancialProjectionData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const handleSubmit = async (finalData: FinancialProjectionData) => {
    try {
      // Submit projections data to the server
      const response = await fetch('/api/projections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        throw new Error(`Failed to save projections: ${await response.text()}`);
      }

      // Generate and download the projections report
      const reportResponse = await fetch('/api/projections/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      if (!reportResponse.ok) {
        throw new Error(`Failed to generate report: ${await reportResponse.text()}`);
      }

      const blob = await reportResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'financial-projections-report.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error submitting projections:', error);
      // Handle error (show toast notification, etc.)
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Financial Projections Wizard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0">
            <div className="h-2 bg-muted rounded-full">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="pt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {currentStep === 0 && (
                  <RevenueProjectionsStep
                    data={data}
                    onUpdate={handleUpdate}
                    onNext={handleNext}
                  />
                )}
                {currentStep === 1 && (
                  <ExpensesProjectionsStep
                    data={data}
                    onUpdate={handleUpdate}
                    onNext={handleNext}
                    onBack={handleBack}
                  />
                )}
                {currentStep === 2 && (
                  <FundUtilizationStep
                    data={data}
                    onUpdate={handleUpdate}
                    onNext={handleNext}
                    onBack={handleBack}
                  />
                )}
                {currentStep === 3 && (
                  <ProjectionsReviewStep
                    data={data}
                    onUpdate={handleUpdate}
                    onSubmit={handleSubmit}
                    onBack={handleBack}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
