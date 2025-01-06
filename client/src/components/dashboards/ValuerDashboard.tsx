import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, FileCheck, Scale, BookOpen, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ComplianceFramework {
  name: string;
  status: 'compliant' | 'partial' | 'non-compliant';
  score: number;
  requirements: Array<{
    name: string;
    met: boolean;
    description: string;
  }>;
}

interface ValuerDashboardProps {
  valuation: number;
  currency: string;
  industry: string;
  region: string;
  frameworks: ComplianceFramework[];
}

export function ValuerDashboard({
  valuation,
  currency,
  industry,
  region,
  frameworks = defaultFrameworks, // Using mock data for now
}: ValuerDashboardProps) {
  const getComplianceColor = (status: ComplianceFramework['status']) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-500';
      case 'partial':
        return 'bg-yellow-500';
      case 'non-compliant':
        return 'bg-red-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Professional Valuation Dashboard</h1>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Monitor compliance status and generate professional reports aligned with global standards.
          </AlertDescription>
        </Alert>
      </div>

      {/* Compliance Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        {frameworks.map((framework) => (
          <Card key={framework.name} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  {framework.name}
                </div>
                <Badge
                  variant={framework.status === 'compliant' ? 'default' : 
                          framework.status === 'partial' ? 'secondary' : 'destructive'}
                >
                  {framework.status.charAt(0).toUpperCase() + framework.status.slice(1)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Compliance Score</span>
                    <span className="text-sm font-bold">{framework.score}%</span>
                  </div>
                  <Progress 
                    value={framework.score} 
                    className={cn("h-2", getComplianceColor(framework.status))}
                  />
                </div>
                
                <div className="space-y-3">
                  {framework.requirements.map((req, index) => (
                    <div key={index} className="flex items-start gap-2">
                      {req.met ? (
                        <FileCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{req.name}</p>
                        <p className="text-xs text-muted-foreground">{req.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Documentation and Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Valuation Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium">Industry-Specific Requirements</h3>
              <p className="text-sm text-muted-foreground">
                Following {industry} sector guidelines for {region} region
              </p>
              <ul className="text-sm space-y-1">
                <li>• Market approach weightage: 40%</li>
                <li>• Required documentation complete</li>
                <li>• Sector-specific adjustments applied</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Compliance Notes</h3>
              <p className="text-sm text-muted-foreground">
                Key considerations for current valuation
              </p>
              <ul className="text-sm space-y-1">
                <li>• All mandatory disclosures included</li>
                <li>• Methodology documentation complete</li>
                <li>• Risk factors adequately addressed</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Mock data for development
const defaultFrameworks: ComplianceFramework[] = [
  {
    name: 'IVS Framework',
    status: 'compliant',
    score: 95,
    requirements: [
      {
        name: 'Market Approach',
        met: true,
        description: 'Comparable company analysis with appropriate adjustments',
      },
      {
        name: 'Documentation',
        met: true,
        description: 'Complete methodology and assumption documentation',
      },
      {
        name: 'Risk Assessment',
        met: true,
        description: 'Comprehensive risk factor analysis',
      },
    ],
  },
  {
    name: 'ICAI Standards',
    status: 'partial',
    score: 85,
    requirements: [
      {
        name: 'Technical Requirements',
        met: true,
        description: 'Valuation techniques and methods compliance',
      },
      {
        name: 'Reporting Format',
        met: true,
        description: 'Standard report format and disclosures',
      },
      {
        name: 'Peer Review',
        met: false,
        description: 'Independent review of valuation assumptions',
      },
    ],
  },
];
