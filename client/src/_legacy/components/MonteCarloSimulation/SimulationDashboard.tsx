import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { SimulationProgress } from "./SimulationProgress";
import { ConfidenceIntervals } from "./ConfidenceIntervals";
import type { ValuationFormData } from "@/lib/validations";

interface SimulationDashboardProps {
  data: ValuationFormData;
  onSimulationComplete?: (results: any) => void;
}

export function SimulationDashboard({ data, onSimulationComplete }: SimulationDashboardProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>();
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const runSimulation = async () => {
    setIsRunning(true);
    setProgress(0);
    
    try {
      // Start simulation process
      setCurrentStep("Initializing simulation parameters");
      const response = await fetch('/api/simulation/monte-carlo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Simulation failed: ' + response.statusText);
      }

      const result = await response.json();
      setResults(result);
      setProgress(100);
      
      toast({
        title: "Simulation Complete",
        description: "Monte Carlo simulation has finished successfully",
      });

      onSimulationComplete?.(result);
    } catch (error) {
      console.error('Simulation error:', error);
      toast({
        title: "Simulation Failed",
        description: error instanceof Error ? error.message : "An error occurred during simulation",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <Button
            onClick={runSimulation}
            disabled={isRunning}
            className="w-full sm:w-auto"
          >
            {isRunning ? "Running Simulation..." : "Run Monte Carlo Simulation"}
          </Button>
        </div>
      </Card>

      {(isRunning || results) && (
        <SimulationProgress
          progress={progress}
          iterations={10000}
          isRunning={isRunning}
          currentStep={currentStep}
        />
      )}

      {results && (
        <ConfidenceIntervals
          data={results.confidenceIntervals.distributionData}
          confidenceLevel={95}
        />
      )}
    </div>
  );
}
