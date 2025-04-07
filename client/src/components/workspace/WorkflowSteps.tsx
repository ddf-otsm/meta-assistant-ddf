import { ProjectStep } from "@shared/schema";

interface WorkflowStepsProps {
  steps: ProjectStep[];
  currentStep: ProjectStep;
  onStepClick?: (step: ProjectStep) => void;
}

export default function WorkflowSteps({ steps, currentStep, onStepClick }: WorkflowStepsProps) {
  return (
    <div className="mb-8">
      <div className="horizontal-scrollable pb-4">
        <div className="inline-flex items-center">
          {steps.map((step, index) => {
            // Calculate the status of the step
            const isActive = step === currentStep;
            const isCompleted = steps.indexOf(currentStep) > steps.indexOf(step);
            
            // Format the step label
            const stepLabel = step.charAt(0).toUpperCase() + step.slice(1);
            
            return (
              <div className="flex items-center" key={step}>
                <div className="flex flex-col items-center">
                  <div 
                    className={`h-10 w-10 rounded-full flex items-center justify-center cursor-pointer
                      ${isCompleted ? 'bg-primary text-primary-foreground' : 
                        isActive ? 'bg-primary/10 text-primary border-2 border-primary' : 
                        'bg-muted text-muted-foreground'}`}
                    onClick={() => onStepClick && onStepClick(step)}
                  >
                    {index + 1}
                  </div>
                  <span 
                    className={`text-xs mt-1 font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    {stepLabel}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className={`h-1 w-16 ${isCompleted ? 'bg-primary' : 'bg-muted'}`}
                  ></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
