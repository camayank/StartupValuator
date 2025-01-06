import { useState, useEffect } from 'react';
import { useFloating, offset, flip, shift, arrow } from '@floating-ui/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/hooks/use-user';
import { ActivityTracker } from '@/services/activityTracker';

interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  examples?: { label: string; data: any }[];
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="valuation"]',
    title: 'Start Your Valuation',
    content: 'Begin by calculating your startup\'s value using our AI-powered valuation tool.',
    placement: 'bottom',
    examples: [
      { 
        label: 'SaaS Example',
        data: {
          revenue: 1000000,
          growthRate: 120,
          margins: 75,
          sector: 'technology'
        }
      },
      {
        label: 'E-commerce Example',
        data: {
          revenue: 5000000,
          growthRate: 60,
          margins: 25,
          sector: 'retail'
        }
      }
    ]
  },
  {
    target: '[data-tour="financial-metrics"]',
    title: 'Enter Financial Metrics',
    content: 'Input your key financial data. Our AI will help validate and suggest industry-standard values.',
    placement: 'right',
  },
  {
    target: '[data-tour="projections"]',
    title: 'Financial Projections',
    content: 'Create detailed financial forecasts with our AI assistance. Compare against industry benchmarks.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="sensitivity"]',
    title: 'Sensitivity Analysis',
    content: 'See how different scenarios affect your valuation by adjusting key parameters.',
    placement: 'left',
  },
  {
    target: '[data-tour="report"]',
    title: 'Generate Reports',
    content: 'Create professional valuation reports and pitch deck slides with your branding.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="dashboard"]',
    title: 'Track Performance',
    content: 'Monitor KPIs, burn rate, and other vital metrics in real-time.',
    placement: 'left',
  }
];

export function TourGuide() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useUser();

  const {
    refs,
    floatingStyles,
    context
  } = useFloating({
    open: isVisible,
    placement: tourSteps[currentStep]?.placement || 'bottom',
    middleware: [
      offset(8),
      flip(),
      shift(),
    ],
  });

  useEffect(() => {
    // Check if this is the user's first visit or returning after 30 days
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    const lastTourDate = localStorage.getItem('lastTourDate');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (!hasSeenTour || (lastTourDate && new Date(lastTourDate) < thirtyDaysAgo)) {
      setIsVisible(true);
      localStorage.setItem('hasSeenTour', 'true');
      localStorage.setItem('lastTourDate', new Date().toISOString());
      localStorage.setItem('tourStartTime', Date.now().toString());
    }
  }, [user]);

  useEffect(() => {
    if (isVisible) {
      const targetElement = document.querySelector(tourSteps[currentStep].target);
      if (targetElement) {
        refs.setReference(targetElement);
      }
    }
  }, [currentStep, isVisible, refs]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);

      // Track step completion
      if (user) {
        ActivityTracker.trackActivity(user.id, 'tour_step_completed', {
          step: currentStep + 1,
          stepName: tourSteps[currentStep].title
        });
      }
    } else {
      setIsVisible(false);
      // Track tour completion
      if (user) {
        ActivityTracker.trackActivity(user.id, 'onboarding_completed', {
          stepsCompleted: tourSteps.length,
          timeSpent: Date.now() - Number(localStorage.getItem('tourStartTime'))
        });
      }
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    if (user) {
      ActivityTracker.trackActivity(user.id, 'onboarding_skipped', {
        stepsCompleted: currentStep,
        timeSpent: Date.now() - Number(localStorage.getItem('tourStartTime'))
      });
    }
  };

  const handleExampleClick = (data: any) => {
    // Dispatch an event to pre-fill the form with example data
    window.dispatchEvent(new CustomEvent('prefill-valuation', { detail: data }));
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div ref={refs.setFloating} style={floatingStyles}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <Card className="w-96 p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-3">{tourSteps[currentStep].title}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {tourSteps[currentStep].content}
            </p>

            {/* Example scenarios */}
            {tourSteps[currentStep].examples && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Try these examples:</p>
                <div className="flex gap-2">
                  {tourSteps[currentStep].examples.map((example, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => handleExampleClick(example.data)}
                    >
                      {example.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                Skip Tour
              </Button>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {currentStep + 1} / {tourSteps.length}
                </span>
                <Button onClick={handleNext}>
                  {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}