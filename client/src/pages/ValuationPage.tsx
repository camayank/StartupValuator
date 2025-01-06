import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Building2, LineChart, Calculator, Shield, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const STEPS = [
  { id: 'company', title: 'Company Info', icon: Building2 },
  { id: 'financials', title: 'Financial Data', icon: LineChart },
  { id: 'projections', title: 'Projections', icon: Calculator },
  { id: 'risk', title: 'Risk Analysis', icon: Shield },
  { id: 'review', title: 'Review', icon: BookOpen }
];

const INDUSTRIES = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'retail', label: 'Retail' },
  { value: 'manufacturing', label: 'Manufacturing' }
];

const COMPANY_STAGES = [
  { value: 'idea', label: 'Idea Stage' },
  { value: 'mvp', label: 'MVP' },
  { value: 'early_revenue', label: 'Early Revenue' },
  { value: 'growth', label: 'Growth' },
  { value: 'scaling', label: 'Scaling' }
];

export default function ValuationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState(STEPS[0].id);
  const { toast } = useToast();
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    stage: '',
    revenue: 0,
    growthRate: 0,
    margins: 0,
    employeeCount: 0,
    marketSize: 0,
    competitorCount: 0,
    riskScore: 50
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      setActiveTab(STEPS[currentStep + 1].id);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setActiveTab(STEPS[currentStep - 1].id);
    }
  };

  const handleTabChange = (tabId: string) => {
    const newIndex = STEPS.findIndex(step => step.id === tabId);
    if (newIndex <= currentStep) {
      setCurrentStep(newIndex);
      setActiveTab(tabId);
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
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
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
                  >
                    <Icon className="h-6 w-6 mb-2" />
                    <span className="text-sm">{step.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="mt-8">
              <TabsContent value="company">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Please provide basic information about your company.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          placeholder="Enter your company name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="industry">Industry</Label>
                        <Select
                          value={formData.industry}
                          onValueChange={(value) => handleInputChange('industry', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {INDUSTRIES.map((industry) => (
                              <SelectItem key={industry.value} value={industry.value}>
                                {industry.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="stage">Company Stage</Label>
                        <Select
                          value={formData.stage}
                          onValueChange={(value) => handleInputChange('stage', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your company stage" />
                          </SelectTrigger>
                          <SelectContent>
                            {COMPANY_STAGES.map((stage) => (
                              <SelectItem key={stage.value} value={stage.value}>
                                {stage.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="financials">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Enter your company's financial metrics.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="revenue">Annual Revenue (USD)</Label>
                        <Input
                          id="revenue"
                          type="number"
                          value={formData.revenue}
                          onChange={(e) => handleInputChange('revenue', Number(e.target.value))}
                          placeholder="Enter your annual revenue"
                        />
                      </div>

                      <div>
                        <Label htmlFor="growthRate">Growth Rate (%)</Label>
                        <Input
                          id="growthRate"
                          type="number"
                          value={formData.growthRate}
                          onChange={(e) => handleInputChange('growthRate', Number(e.target.value))}
                          placeholder="Enter your growth rate"
                        />
                      </div>

                      <div>
                        <Label htmlFor="margins">Operating Margins (%)</Label>
                        <Input
                          id="margins"
                          type="number"
                          value={formData.margins}
                          onChange={(e) => handleInputChange('margins', Number(e.target.value))}
                          placeholder="Enter your operating margins"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projections">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Provide your growth projections and market expectations.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="marketSize">Total Addressable Market (USD)</Label>
                        <Input
                          id="marketSize"
                          type="number"
                          value={formData.marketSize}
                          onChange={(e) => handleInputChange('marketSize', Number(e.target.value))}
                          placeholder="Enter your TAM"
                        />
                      </div>

                      <div>
                        <Label htmlFor="employeeCount">Number of Employees</Label>
                        <Input
                          id="employeeCount"
                          type="number"
                          value={formData.employeeCount}
                          onChange={(e) => handleInputChange('employeeCount', Number(e.target.value))}
                          placeholder="Enter number of employees"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="risk">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Assess various risk factors affecting your business.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="competitorCount">Number of Direct Competitors</Label>
                        <Input
                          id="competitorCount"
                          type="number"
                          value={formData.competitorCount}
                          onChange={(e) => handleInputChange('competitorCount', Number(e.target.value))}
                          placeholder="Enter number of competitors"
                        />
                      </div>

                      <div>
                        <Label>Risk Assessment Score</Label>
                        <div className="pt-2">
                          <Slider
                            value={[formData.riskScore]}
                            onValueChange={([value]) => handleInputChange('riskScore', value)}
                            max={100}
                            step={1}
                          />
                          <div className="text-sm text-muted-foreground mt-1">
                            {formData.riskScore}% - Higher score indicates higher risk
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="review">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Review your inputs before generating the valuation report.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Company Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="font-medium">Company Name</div>
                          <div className="text-muted-foreground">{formData.companyName}</div>
                        </div>
                        <div>
                          <div className="font-medium">Industry</div>
                          <div className="text-muted-foreground">{formData.industry}</div>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold">Financial Metrics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="font-medium">Annual Revenue</div>
                          <div className="text-muted-foreground">${formData.revenue.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="font-medium">Growth Rate</div>
                          <div className="text-muted-foreground">{formData.growthRate}%</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
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