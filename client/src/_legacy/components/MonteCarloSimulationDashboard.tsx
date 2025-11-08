import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { MonteCarloSimulationResult } from "@/lib/services/monteCarloSimulation";

interface Props {
  data: any;
  onSimulationComplete?: (results: MonteCarloSimulationResult) => void;
}

export function MonteCarloSimulationDashboard({ data, onSimulationComplete }: Props) {
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [results, setResults] = useState<MonteCarloSimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (results) {
      onSimulationComplete?.(results);
    }
  }, [results, onSimulationComplete]);

  const runSimulation = async () => {
    setIsRunning(true);
    setError(null);
    setSimulationProgress(0);

    try {
      const response = await fetch('/api/simulation/monte-carlo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Simulation failed: ${response.statusText}`);
      }

      const result = await response.json();
      setResults(result);
      setSimulationProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run simulation');
    } finally {
      setIsRunning(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(value);
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Simulation Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Monte Carlo Simulation</span>
            <Button
              onClick={runSimulation}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running Simulation...
                </>
              ) : (
                'Run Simulation'
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isRunning && (
            <div className="space-y-2">
              <Progress value={simulationProgress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Running {data.iterations || 10000} iterations...
              </p>
            </div>
          )}

          {results && (
            <div className="space-y-6">
              {/* Confidence Intervals Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Valuation Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={results.confidenceIntervals.distributionData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="value" 
                          tickFormatter={formatCurrency}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number) => formatCurrency(value)}
                        />
                        <Area
                          type="monotone"
                          dataKey="frequency"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Sensitivity Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Sensitivity Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={results.sensitivityAnalysis}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis 
                          dataKey="factor" 
                          type="category" 
                          width={150}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="impact"
                          fill="#82ca9d"
                          name="Impact"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {results.riskAnalysis.industryRisks.map((risk, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{risk.factor}</h4>
                          <p className="text-sm text-muted-foreground">
                            Probability: {(risk.probability * 100).toFixed(1)}%
                          </p>
                        </div>
                        <Progress
                          value={risk.impact * 100}
                          className="w-[200px]"
                          indicatorColor={
                            risk.impact > 0.7
                              ? "bg-red-500"
                              : risk.impact > 0.4
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Summary Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Expected Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {formatCurrency(results.expectedValue)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>90% Confidence Range</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      {formatCurrency(results.confidenceIntervals.lower90)} -{" "}
                      {formatCurrency(results.confidenceIntervals.upper90)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Iterations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {results.iterations.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
