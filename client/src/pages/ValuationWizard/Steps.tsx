interface StepsProps {
  currentStep: number;
  steps: readonly string[];
}

export function Steps({ currentStep, steps }: StepsProps) {
  return (
    <div className="relative mb-8">
      <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-gray-200" />
      
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div 
              key={step}
              className="flex flex-col items-center"
            >
              <div 
                className={`
                  z-10 flex h-8 w-8 items-center justify-center rounded-full border-2
                  ${isCompleted ? 'border-primary bg-primary text-primary-foreground' :
                    isCurrent ? 'border-primary bg-background text-primary' :
                    'border-gray-300 bg-background text-gray-300'}
                `}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span 
                className={`
                  mt-2 text-sm
                  ${isCompleted || isCurrent ? 'text-primary' : 'text-gray-500'}
                `}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
