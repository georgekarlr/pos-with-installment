import React from 'react';
import { Check } from 'lucide-react';

interface StepperProps {
  steps: string[];
  activeIndex: number;
  onStepClick?: (index: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ steps, activeIndex, onStepClick }) => {
  return (
    <nav aria-label="Progress">
      <ol className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-0 w-full">
        {steps.map((label, idx) => {
          const isActive = idx === activeIndex;
          const isCompleted = idx < activeIndex;
          const isLast = idx === steps.length - 1;

          return (
            <li key={idx} className={`flex-1 flex items-center w-full ${!isLast ? 'md:w-full' : 'md:w-auto'}`}>
              <button
                type="button"
                onClick={() => onStepClick && onStepClick(idx)}
                disabled={!isCompleted && !isActive}
                className="group flex items-center focus:outline-none disabled:cursor-not-allowed"
              >
                <span className="flex items-center text-sm font-medium">
                  <span
                    className={`
                      flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200
                      ${isCompleted ? 'bg-blue-600 border-blue-600' : ''}
                      ${isActive ? 'border-blue-600 bg-white text-blue-600' : ''}
                      ${!isCompleted && !isActive ? 'border-gray-300 bg-white text-gray-500' : ''}
                    `}
                  >
                    {isCompleted ? (
                      <Check className="h-6 w-6 text-white" aria-hidden="true" />
                    ) : (
                      <span className={isActive ? 'text-blue-600' : 'text-gray-500'}>{idx + 1}</span>
                    )}
                  </span>
                  <span
                    className={`
                      ml-4 text-sm font-medium transition-colors duration-200
                      ${isActive ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'}
                    `}
                  >
                    {label}
                  </span>
                </span>
              </button>

              {!isLast && (
                <div className="hidden md:block mx-4 h-0.5 flex-1 bg-gray-200" aria-hidden="true">
                  <div
                    className={`h-full bg-blue-600 transition-all duration-500 ease-in-out`}
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Stepper;
