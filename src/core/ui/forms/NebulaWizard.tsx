import React, { useState } from 'react';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
}

interface NebulaWizardProps {
  steps: WizardStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  children: React.ReactNode;
  onComplete: () => void;
  isCompleteDisabled?: boolean;
}

export const NebulaWizard: React.FC<NebulaWizardProps> = ({
  steps,
  currentStepIndex,
  onStepChange,
  children,
  onComplete,
  isCompleteDisabled = false,
}) => {
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div className="flex flex-col space-y-6">
      {/* Steps Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
        {steps.map((step, index) => {
          const isPassed = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step.id} className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                isPassed
                  ? 'bg-emerald-600 text-white'
                  : isCurrent
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-200'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {isPassed ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <div className="hidden sm:block">
                <div className={`text-xs font-bold ${isCurrent ? 'text-slate-900' : 'text-slate-500'}`}>
                  {step.title}
                </div>
                {step.description && <div className="text-[10px] text-slate-400">{step.description}</div>}
              </div>
              {index < steps.length - 1 && <div className="w-8 h-px bg-slate-200 mx-2 hidden md:block" />}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        {children}
      </div>

      {/* Wizard Footer Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          disabled={currentStepIndex === 0}
          onClick={() => onStepChange(currentStepIndex - 1)}
          className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {isLastStep ? (
          <button
            type="button"
            disabled={isCompleteDisabled}
            onClick={onComplete}
            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
          >
            <span>Complete</span>
            <Check className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onStepChange(currentStepIndex + 1)}
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer shadow-2xs"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
