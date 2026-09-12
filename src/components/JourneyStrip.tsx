// src/components/JourneyStrip.tsx
import React from 'react';
import { Check } from 'lucide-react';
import { JourneyStep, JourneyStepId } from '../lib/journey';

interface JourneyStripProps {
  steps: JourneyStep[];
  onStepClick: (id: JourneyStepId) => void;
}

export const JourneyStrip: React.FC<JourneyStripProps> = ({ steps, onStepClick }) => {
  const current = steps.find((s) => s.state === 'current');
  return (
    <nav aria-label="Design journey" className="journey-strip">
      <ol className="journey-steps">
        {steps.map((step, index) => (
          <li key={step.id} className={`journey-step is-${step.state}`}>
            <button
              type="button"
              onClick={() => onStepClick(step.id)}
              aria-current={step.state === 'current' ? 'step' : undefined}
              className="journey-step-button"
            >
              <span className="journey-step-index">
                {step.state === 'done' ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              <span className="journey-step-label">{step.label}</span>
            </button>
            {index < steps.length - 1 && <span className="journey-step-line" aria-hidden="true" />}
          </li>
        ))}
      </ol>
      {current && <p className="journey-hint">{current.hint}</p>}
    </nav>
  );
};
