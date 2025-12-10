import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
}

const steps = [
  { id: 1, label: 'Input' },
  { id: 2, label: 'Preview' },
  { id: 3, label: 'Analysis' },
  { id: 4, label: 'Select' },
  { id: 5, label: 'Generate' },
  { id: 6, label: 'Done' }
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="w-full py-4 border-b border-slate-200 bg-white mb-6">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          
          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                  ${isCompleted ? 'bg-green-500 text-white' : ''}
                  ${isCurrent ? 'bg-primary-600 text-white ring-4 ring-primary-100' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-slate-200 text-slate-500' : ''}
                `}
              >
                {isCompleted ? <Check size={16} /> : step.id}
              </div>
              <span 
                className={`
                  mt-2 text-xs font-medium uppercase tracking-wide
                  ${isCurrent ? 'text-primary-700' : 'text-slate-400'}
                `}
              >
                {step.label}
              </span>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div 
                  className={`
                    absolute top-4 left-1/2 w-full h-[2px] -z-10
                    ${step.id < currentStep ? 'bg-green-500' : 'bg-slate-200'}
                  `}
                  style={{ width: 'calc(100% * 6)' }} // Crude connector extension, visually handled by flex space usually, but simplified here
                />
              )}
            </div>
          );
        })}
      </div>
      {/* Visual fix for connectors: Using a separate layer would be better but CSS flex gap works for spacing */}
    </div>
  );
};
