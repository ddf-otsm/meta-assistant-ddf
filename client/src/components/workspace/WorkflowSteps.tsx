import { ProjectStep } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface WorkflowStepsProps {
  steps: ProjectStep[];
  currentStep: ProjectStep;
  onStepClick?: (step: ProjectStep) => void;
}

export default function WorkflowSteps({ steps, currentStep, onStepClick }: WorkflowStepsProps) {
  console.log("WorkflowSteps rendering with currentStep:", currentStep);
  
  const handleStepClick = (step: ProjectStep) => {
    console.log("Step clicked in component:", step);
    if (onStepClick) {
      onStepClick(step);
    }
  };
  
  return (
    <div className="mb-8">
      <div className="overflow-x-auto pb-4">
        <div className="inline-flex items-center space-x-1">
          {steps.map((step, index) => {
            // Calculate the status of the step
            const isActive = step === currentStep;
            const isCompleted = steps.indexOf(currentStep) > steps.indexOf(step);
            
            // Format the step label
            const stepLabel = step.charAt(0).toUpperCase() + step.slice(1);
            
            return (
              <div className="flex items-center" key={step}>
                <Button
                  type="button"
                  variant="ghost"
                  className="flex flex-col items-center p-1 h-auto"
                  onClick={() => handleStepClick(step)}
                >
                  <div 
                    className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors duration-200
                      ${isCompleted ? 'bg-primary-600 text-white' : 
                        isActive ? 'bg-primary-100 text-primary-600 border-2 border-primary-600 shadow-md' : 
                        'bg-dark-200 text-dark-600 hover:bg-dark-300'}`}
                  >
                    {index + 1}
                  </div>
                  <span 
                    className={`text-xs mt-1 font-medium transition-colors duration-200 ${isActive ? 'text-primary-600' : isCompleted ? 'text-dark-700' : 'text-dark-500'}`}
                  >
                    {stepLabel}
                  </span>
                </Button>
                {index < steps.length - 1 && (
                  <div 
                    className={`h-1 w-12 sm:w-16 md:w-20 transition-colors duration-300 
                      ${isCompleted ? 'bg-primary-600' : 
                      isActive ? 'bg-gradient-to-r from-primary-600 to-dark-300' : 
                      'bg-dark-300'}`}
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
