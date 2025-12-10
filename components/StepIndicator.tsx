import React from 'react';
import { Check, Edit3, Cpu, Layout } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
}

const steps = [
  { id: 1, label: 'Input', fullLabel: 'Input & Context', icon: Edit3 },
  { id: 2, label: 'Process', fullLabel: 'AI Processing', icon: Cpu },
  { id: 3, label: 'Result', fullLabel: 'Result & Fine-tune', icon: Layout },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="w-full py-4 sm:py-6 border-b border-slate-200 bg-white mb-4 sm:mb-6">
      <div className="max-w-3xl mx-auto px-4 w-full">
        <div className="flex items-center w-full justify-between relative">
          {/* Background Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-0 -translate-y-1/2 rounded-full" />
          
          {/* Active Line */}
          <div 
            className="absolute top-1/2 left-0 h-1 bg-primary-500 -z-0 -translate-y-1/2 rounded-full transition-all duration-700 ease-in-out"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step, index) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const Icon = step.icon;
            
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center group">
                <div 
                  className={`
                    w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-sm sm:text-lg font-bold transition-all duration-300 shadow-sm
                    ${isCompleted ? 'bg-primary-500 text-white scale-105' : ''}
                    ${isCurrent ? 'bg-white text-primary-600 ring-4 ring-primary-100 border-2 border-primary-500 scale-110' : ''}
                    ${!isCompleted && !isCurrent ? 'bg-white text-slate-300 border-2 border-slate-200' : ''}
                  `}
                >
                  {isCompleted ? <Check size={20} className="sm:w-6 sm:h-6" /> : <Icon size={18} className="sm:w-5 sm:h-5" />}
                </div>
                <span 
                  className={`
                    absolute top-12 sm:top-14 w-32 sm:w-40 text-center text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-colors duration-300
                    ${isCurrent ? 'text-primary-700' : 'text-slate-400'}
                    ${isCompleted ? 'text-primary-600' : ''}
                  `}
                >
                  <span className="hidden sm:inline">{step.fullLabel}</span>
                  <span className="sm:hidden">{step.label}</span>
                </span>
              </div>
            );
          })}
        </div>
        <div className="h-6 sm:h-8"></div> 
      </div>
    </div>
  );
};