import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Building2,
  DollarSign,
  Users,
  Target,
  Shield
} from 'lucide-react';

interface ProgressiveFormFlowProps {
  industry: string;
  stage: string;
  onComplete: (data: any) => void;
}

interface FormStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  component: React.ComponentType<any>;
  validation: (data: any) => { isValid: boolean; errors: string[] };
}

const BusinessInfoStep: React.FC<{ data: any; onChange: (data: any) => void }> = ({ data, onChange }) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <label className="text-sm font-medium">Company Name</label>
      <input 
        className="w-full p-2 border rounded-md"
        value={data.companyName || ''}
        onChange={(e) => onChange({ ...data, companyName: e.target.value })}
        placeholder="Enter company name"
      />
    </div>
    <div className="space-y-2">
      <label className="text-sm font-medium">Business Model</label>
      <select 
        className="w-full p-2 border rounded-md"
        value={data.businessModel || ''}
        onChange={(e) => onChange({ ...data, businessModel: e.target.value })}
      >
        <option value="">Select business model</option>
        <option value="saas">SaaS</option>
        <option value="marketplace">Marketplace</option>
        <option value="ecommerce">E-commerce</option>
        <option value="subscription">Subscription</option>
      </select>
    </div>
  </div>
);

const FinancialStep: React.FC<{ data: any; onChange: (data: any) => void }> = ({ data, onChange }) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <label className="text-sm font-medium">Monthly Revenue ($)</label>
      <input 
        type="number"
        className="w-full p-2 border rounded-md"
        value={data.revenue || ''}
        onChange={(e) => onChange({ ...data, revenue: parseFloat(e.target.value) || 0 })}
        placeholder="0"
      />
    </div>
    <div className="space-y-2">
      <label className="text-sm font-medium">Monthly Burn Rate ($)</label>
      <input 
        type="number"
        className="w-full p-2 border rounded-md"
        value={data.burnRate || ''}
        onChange={(e) => onChange({ ...data, burnRate: parseFloat(e.target.value) || 0 })}
        placeholder="0"
      />
    </div>
  </div>
);

export function ProgressiveFormFlow({ industry, stage, onComplete }: ProgressiveFormFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const formSteps: FormStep[] = [
    {
      id: 'business-info',
      title: 'Business Information',
      description: 'Tell us about your company and business model',
      icon: Building2,
      component: BusinessInfoStep,
      validation: (data) => ({
        isValid: !!data.companyName && !!data.businessModel,
        errors: [
          ...(!data.companyName ? ['Company name is required'] : []),
          ...(!data.businessModel ? ['Business model is required'] : [])
        ]
      })
    },
    {
      id: 'financial',
      title: 'Financial Metrics',
      description: 'Current financial performance and projections',
      icon: DollarSign,
      component: FinancialStep,
      validation: (data) => ({
        isValid: data.revenue >= 0 && data.burnRate >= 0,
        errors: [
          ...(data.revenue < 0 ? ['Revenue cannot be negative'] : []),
          ...(data.burnRate < 0 ? ['Burn rate cannot be negative'] : [])
        ]
      })
    }
  ];

  const currentStepData = formSteps[currentStep];

  const validateCurrentStep = () => {
    const validation = currentStepData.validation(formData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (!completedSteps.includes(currentStepData.id)) {
        setCompletedSteps(prev => [...prev, currentStepData.id]);
      }
      
      if (currentStep < formSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete(formData);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDataChange = (newData: any) => {
    setFormData(newData);
    setErrors([]);
  };

  const progressPercentage = ((currentStep + 1) / formSteps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <currentStepData.icon className="h-5 w-5" />
                {currentStepData.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {currentStepData.description}
              </p>
            </div>
            <Badge variant="outline">
              Step {currentStep + 1} of {formSteps.length}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <currentStepData.component 
                data={formData} 
                onChange={handleDataChange}
              />
              
              {errors.length > 0 && (
                <Alert className="mt-4 border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      {errors.map((error, index) => (
                        <p key={index} className="text-sm">{error}</p>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            <Button onClick={handleNext}>
              {currentStep === formSteps.length - 1 ? 'Complete' : 'Next'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {industry === 'technology' && stage === 'seed' && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-1">Industry Insight</p>
            <p className="text-sm">
              Seed-stage technology companies typically have 5-20 employees and $50K-500K monthly revenue. 
              Consider focusing on user growth metrics and product-market fit indicators.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}