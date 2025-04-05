import { ProjectStep } from '@shared/schema.js';

interface WorkflowStepsProps {
  steps: ProjectStep[];
  currentStep: ProjectStep;
  onStepClick?: (step: ProjectStep) => void;
}

export default function WorkflowSteps({ steps, currentStep, onStepClick }: WorkflowStepsProps) {
  return (
    <div className="mb-8">
      <div className="horizontal-scrollable pb-4">
        <div className="inline-flex items-center" role="tablist">
          {steps.map((step, index) => {
            // Calculate the status of the step
            const isActive = step === currentStep;
            const isCompleted = steps.indexOf(currentStep) > steps.indexOf(step);

            // Format the step label
            const stepLabel = step.charAt(0).toUpperCase() + step.slice(1);

            return (
              <div className="flex items-center" key={step}>
                <div className="flex flex-col items-center">
                  <button
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Step ${index + 1}: ${stepLabel}`}
                    className={`h-10 w-10 rounded-full flex items-center justify-center cursor-pointer
                      ${
                        isCompleted
                          ? 'bg-primary-600 text-white'
                          : isActive
                            ? 'bg-primary-100 text-primary-600 border-2 border-primary-600'
                            : 'bg-dark-200 text-dark-600'
                      }`}
                    onClick={() => onStepClick && onStepClick(step)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onStepClick && onStepClick(step);
                      }
                    }}
                  >
                    {index + 1}
                  </button>
                  <span
                    className={`text-xs mt-1 font-medium ${isActive ? 'text-primary-600' : isCompleted ? 'text-dark-700' : 'text-dark-500'}`}
                  >
                    {stepLabel}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 w-16 ${isCompleted ? 'bg-primary-600' : 'bg-dark-300'}`}
                    role="presentation"
                    aria-hidden="true"
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
