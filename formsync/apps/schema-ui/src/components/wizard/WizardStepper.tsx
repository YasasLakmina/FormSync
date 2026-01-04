/**
 * Wizard Stepper Component
 * 
 * Visual progress indicator showing:
 * - Current step
 * - Completed steps
 * - Future steps
 * - Step labels
 */

import React from 'react';
import { Check } from 'lucide-react';
import { useWizard } from './WizardContext';

interface WizardStepperProps {
  className?: string;
}

interface StepInfo {
  number: number;
  label: string;
  icon: string;
}

const STEPS: StepInfo[] = [
  { number: 1, label: 'Mode', icon: '🎯' },
  { number: 2, label: 'Template', icon: '📋' },
  { number: 3, label: 'Fields', icon: '📝' },
  { number: 4, label: 'Preview', icon: '👁️' },
  { number: 5, label: 'Validate', icon: '✓' },
  { number: 6, label: 'AI Enhance', icon: '✨' },
  { number: 7, label: 'Complete', icon: '🎉' }
];

export function WizardStepper({ className = '' }: WizardStepperProps) {
  const { state, dispatch } = useWizard();
  const { currentStep } = state;

  const handleStepClick = (stepNumber: number) => {
    // Only allow clicking on completed steps or current step
    if (stepNumber <= currentStep) {
      dispatch({ type: 'SET_STEP', payload: stepNumber });
    }
  };

  return (
    <div className={`wizard-stepper ${className}`}>
      <div className="stepper-container">
        {STEPS.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isFuture = step.number > currentStep;
          const isClickable = step.number <= currentStep;

          return (
            <div key={step.number} className="step-wrapper">
              {/* Step Circle */}
              <button
                onClick={() => handleStepClick(step.number)}
                disabled={!isClickable}
                className={`step-circle ${
                  isCompleted ? 'completed' : ''
                } ${isCurrent ? 'current' : ''} ${
                  isFuture ? 'future' : ''
                } ${isClickable ? 'clickable' : ''}`}
                aria-label={`Step ${step.number}: ${step.label}`}
              >
                {isCompleted ? (
                  <Check className="check-icon" size={20} />
                ) : (
                  <span className="step-icon">{step.icon}</span>
                )}
              </button>

              {/* Step Label */}
              <div className={`step-label ${isCurrent ? 'current' : ''}`}>
                {step.label}
              </div>

              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div
                  className={`step-connector ${
                    step.number < currentStep ? 'completed' : ''
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .wizard-stepper {
          padding: 2rem 0;
          background: linear-gradient(to bottom, #f9fafb, #ffffff);
          border-bottom: 1px solid #e5e7eb;
        }

        .stepper-container {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          position: relative;
        }

        .step-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          flex: 1;
        }

        .step-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 600;
          transition: all 0.3s ease;
          border: 3px solid #e5e7eb;
          background: white;
          cursor: default;
          position: relative;
          z-index: 2;
        }

        .step-circle.clickable {
          cursor: pointer;
        }

        .step-circle.clickable:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .step-circle.completed {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          border-color: #6366f1;
          color: white;
        }

        .step-circle.current {
          border-color: #6366f1;
          border-width: 4px;
          background: white;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
          animation: pulse 2s infinite;
        }

        .step-circle.future {
          background: #f9fafb;
          color: #9ca3af;
          border-color: #e5e7eb;
        }

        .step-icon {
          font-size: 24px;
        }

        .check-icon {
          color: white;
        }

        .step-label {
          margin-top: 0.75rem;
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          text-align: center;
          white-space: nowrap;
          transition: all 0.3s ease;
        }

        .step-label.current {
          color: #6366f1;
          font-weight: 600;
          font-size: 14px;
        }

        .step-connector {
          position: absolute;
          top: 30px;
          left: calc(50% + 30px);
          right: calc(-50% + 30px);
          height: 3px;
          background: #e5e7eb;
          z-index: 1;
          transition: background 0.3s ease;
        }

        .step-connector.completed {
          background: linear-gradient(to right, #6366f1, #4f46e5);
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(99, 102, 241, 0.15);
          }
        }

        @media (max-width: 768px) {
          .stepper-container {
            padding: 0 1rem;
          }

          .step-circle {
            width: 48px;
            height: 48px;
            font-size: 20px;
          }

          .step-label {
            font-size: 11px;
          }

          .step-connector {
            top: 24px;
            left: calc(50% + 24px);
            right: calc(-50% + 24px);
          }
        }
      `}</style>
    </div>
  );
}
