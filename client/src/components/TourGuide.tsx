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
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="valuation"]',
    title: 'Start Your Valuation',
    content: 'Begin by calculating your startup\'s value using our AI-powered valuation tool.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="projections"]',
    title: 'Financial Projections',
    content: 'Create detailed financial forecasts to support your valuation.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="pitch-deck"]',
    title: 'Generate Pitch Deck',
    content: 'Create investor-ready presentations with our AI assistance.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="dashboard"]',
    title: 'Monitor Progress',
    content: 'Track your startup\'s health and progress over time.',
    placement: 'left',
  },
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
    // Check if this is the user's first visit
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour && user) {
      setIsVisible(true);
      localStorage.setItem('hasSeenTour', 'true');
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
    } else {
      setIsVisible(false);
      // Track tour completion
      if (user) {
        ActivityTracker.trackActivity(user.id, 'onboarding_completed', {
          stepsCompleted: tourSteps.length,
        });
      }
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    if (user) {
      ActivityTracker.trackActivity(user.id, 'onboarding_skipped', {
        stepsCompleted: currentStep,
      });
    }
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
          <Card className="w-80 p-4 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">{tourSteps[currentStep].title}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {tourSteps[currentStep].content}
            </p>
            <div className="flex justify-between items-center">
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                Skip Tour
              </Button>
              <div className="flex items-center gap-2">
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
