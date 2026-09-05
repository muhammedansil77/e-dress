'use client';

import React from 'react';
import {
  FileText,
  FolderTree,
  Image as ImageIcon,
  Palette,
  DollarSign,
  Boxes,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface StepDef {
  id: number;
  title: string;
  short: string;
  icon: any;
}

export const WIZARD_STEPS: StepDef[] = [
  { id: 1, title: 'Basic Info', short: 'Basic', icon: FileText },
  { id: 2, title: 'Category', short: 'Category', icon: FolderTree },
  { id: 3, title: 'Images', short: 'Images', icon: ImageIcon },
  { id: 4, title: 'Variants', short: 'Variants', icon: Palette },
  { id: 5, title: 'Pricing', short: 'Pricing', icon: DollarSign },
  { id: 6, title: 'Inventory', short: 'Inventory', icon: Boxes },
  { id: 7, title: 'SEO', short: 'SEO', icon: Globe },
  { id: 8, title: 'Publish', short: 'Publish', icon: CheckCircle2 },
];

interface WizardNavProps {
  currentStep: number;
  onStepClick: (stepId: number) => void;
  maxStepUnlocked: number;
}

export const WizardNav: React.FC<WizardNavProps> = ({ currentStep, onStepClick, maxStepUnlocked }) => {
  return (
    <div className="w-full bg-cream-50 rounded-2xl border border-cream-400 p-3 shadow-sm mb-6 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[720px] gap-1">
        {WIZARD_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = step.id < currentStep;
          const isClickable = step.id <= maxStepUnlocked;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all select-none',
                  isActive
                    ? 'bg-coffee-700 text-cream-50 shadow-sm border border-coffee-800 scale-[1.02]'
                    : isCompleted
                    ? 'bg-cream-300/70 text-coffee-900 border border-cream-400/60 hover:bg-cream-300'
                    : isClickable
                    ? 'text-coffee-600 hover:bg-cream-200'
                    : 'text-coffee-600/40 opacity-50 cursor-not-allowed'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold',
                    isActive
                      ? 'bg-gold-500 text-coffee-900'
                      : isCompleted
                      ? 'bg-gold-500/20 text-gold-600 font-black'
                      : 'bg-cream-200 text-coffee-600'
                  )}
                >
                  {isCompleted ? '✓' : step.id}
                </div>
                <span>{step.title}</span>
              </button>

              {idx < WIZARD_STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-[2px] min-w-3 max-w-8 transition-colors',
                    step.id < currentStep ? 'bg-gold-500' : 'bg-cream-300'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
