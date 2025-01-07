import { useQuery } from "@tanstack/react-query";
import { type ValuationReport } from "@/lib/reportGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { AlertTriangle, TrendingUp, DollarSign, Activity, FileText } from "lucide-react";
import { ExportButton } from "@/components/ui/export-button";

interface Props {
  data: ValuationReport;
}

export function ValuationReport({ data }: Props) {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Executive Summary Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Executive Summary
          </CardTitle>
          <ExportButton report={data} />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Company</h3>
              <p className="mt-1 text-lg font-semibold">{data.summary.businessName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Industry</h3>
              <p className="mt-1 text-lg font-semibold">{data.summary.industry}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date</h3>
              <p className="mt-1 text-lg font-semibold">{data.summary.valuationDate}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Base Valuation</h3>
              <p className="mt-1 text-lg font-semibold">
                ${data.summary.valuationRange.base.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Valuation Range</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Conservative</p>
                <p className="text-lg font-semibold">
                  ${data.summary.valuationRange.low.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Base Case</p>
                <p className="text-lg font-semibold">
                  ${data.summary.valuationRange.base.toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600">Optimistic</p>
                <p className="text-lg font-semibold">
                  ${data.summary.valuationRange.high.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* AI Insights Summary */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Key Insights</h3>
            <ul className="space-y-2">
              {data.aiInsights.recommendations.slice(0, 3).map((insight, i) => (
                <li key={i} className="text-sm text-gray-600">• {insight}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Market Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Market Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.marketAnalysis.benchmarks}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Company" fill="#3b82f6" />
                <Bar dataKey="peerAverage" name="Industry Average" fill="#6b7280" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Industry Comparables</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Revenue Multiple</TableHead>
                    <TableHead>EBITDA Multiple</TableHead>
                    <TableHead>Growth Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.marketAnalysis.comparables.map((comparable, i) => (
                    <TableRow key={i}>
                      <TableCell>{comparable.name}</TableCell>
                      <TableCell>{comparable.metrics.evRevenue.toFixed(1)}x</TableCell>
                      <TableCell>{comparable.metrics.evEbitda?.toFixed(1)}x</TableCell>
                      <TableCell>{(comparable.metrics.growthRate * 100).toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Projections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Financial Projections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.financialProjections.periods.map((period, i) => ({
                  period,
                  revenue: data.financialProjections.revenue[i],
                  ebitda: data.financialProjections.ebitda[i],
                  cashFlow: data.financialProjections.netCashFlow[i]
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue" />
                <Line type="monotone" dataKey="ebitda" stroke="#10b981" name="EBITDA" />
                <Line type="monotone" dataKey="cashFlow" stroke="#6366f1" name="Cash Flow" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Detailed Projections</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Operating Cash Flow</TableHead>
                  <TableHead>Investing Cash Flow</TableHead>
                  <TableHead>Financing Cash Flow</TableHead>
                  <TableHead>Net Cash Flow</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.financialProjections.periods.map((period, i) => (
                  <TableRow key={period}>
                    <TableCell>{period}</TableCell>
                    <TableCell>${data.financialProjections.operatingCashFlow[i].toLocaleString()}</TableCell>
                    <TableCell>${data.financialProjections.investingCashFlow[i].toLocaleString()}</TableCell>
                    <TableCell>${data.financialProjections.financingCashFlow[i].toLocaleString()}</TableCell>
                    <TableCell>${data.financialProjections.netCashFlow[i].toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Growth Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Growth Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Market Penetration</h3>
              <p className="text-3xl font-bold text-blue-600">
                {data.growthAnalysis.tamPenetration.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500 mt-1">Current market share</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Growth Drivers</h3>
              <div className="space-y-2">
                {Object.entries(data.growthAnalysis.growthDrivers).map(([driver, weight]) => (
                  <div key={driver} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{driver}</span>
                    <span className="text-sm font-medium">{(weight * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Risk Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.riskAnalysis.map(risk => (
              <Alert key={risk.category} variant={
                risk.score >= 0.7 ? "destructive" :
                risk.score >= 0.4 ? "default" : undefined
              }>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{risk.category} Risk</AlertTitle>
                <AlertDescription>
                  <div className="mt-2">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${risk.score * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm font-medium">
                        {(risk.score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="mt-2 text-sm">{risk.impact}</p>
                    <p className="mt-1 text-sm font-medium">Mitigation: {risk.mitigation}</p>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">AI Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Industry Trends
              </h3>
              <ul className="space-y-2">
                {data.aiInsights.industryTrends.map((trend, i) => (
                  <li key={i} className="text-sm">{trend}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Growth Opportunities
              </h3>
              <ul className="space-y-2">
                {data.aiInsights.growthOpportunities.map((opportunity, i) => (
                  <li key={i} className="text-sm">{opportunity}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Warnings */}
      {data.validationResults.warnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Validation Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.validationResults.warnings.map((warning, i) => (
                <Alert key={i} variant={
                  warning.severity === 'high' ? 'destructive' :
                  warning.severity === 'medium' ? 'default' : undefined
                }>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{warning.field}</AlertTitle>
                  <AlertDescription>
                    {warning.message}
                    {warning.suggestion && (
                      <p className="mt-1 font-medium">
                        Suggested value: {warning.suggestion}
                      </p>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}