'use client'

import type { ReactNode } from 'react'

export interface WizardStep {
  id: string
  title: string
  icon?: string
}

interface FormWizardProps {
  steps: WizardStep[]
  currentStep: number
  onPrev: () => void
  onNext: () => void
  onFinish: () => void
  loading?: boolean
  finishLabel?: string
  canNext?: boolean
  error?: string | null
  className?: string
  children: ReactNode
}

export function FormWizard({
  steps,
  currentStep,
  onPrev,
  onNext,
  onFinish,
  loading = false,
  finishLabel = 'Publish',
  canNext = true,
  error,
  className,
  children,
}: FormWizardProps) {
  const isFirst = currentStep === 0
  const isLast  = currentStep === steps.length - 1

  return (
    <div className={className ?? 'bg-[var(--background)] text-[var(--foreground)] flex flex-col'}>
      {/* Step indicator */}
      <div className="border-b border-[var(--border)] bg-[var(--card)] px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-0">
          {steps.map((step, i) => {
            const done    = i < currentStep
            const active  = i === currentStep
            const isLastStep = i === steps.length - 1

            return (
              <div key={step.id} className="flex items-center">
                {/* Node */}
                <div className="flex items-center gap-2.5 relative">
                  <div className={[
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 flex-shrink-0',
                    done   ? 'bg-[var(--accent)] text-white' :
                    active ? 'bg-[var(--accent)]/20 border-2 border-[var(--accent)] text-[var(--accent)]' :
                             'bg-[var(--muted-bg)] border-2 border-[var(--border)] text-[var(--muted)]',
                  ].join(' ')}>
                    {done ? (
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                      </svg>
                    ) : step.icon ? (
                      <span className="text-base leading-none">{step.icon}</span>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <div className={`text-xs font-semibold leading-tight transition-colors ${active ? 'text-[var(--foreground)]' : done ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`}>
                      {step.title}
                    </div>
                  </div>
                </div>

                {/* Connector */}
                {!isLastStep && (
                  <div className={`h-px w-8 sm:w-12 mx-2 flex-shrink-0 transition-colors ${i < currentStep ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`} />
                )}
              </div>
            )
          })}

          {/* Step count on mobile */}
          <div className="ml-auto text-xs text-[var(--muted)] sm:hidden">
            {currentStep + 1} / {steps.length}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            {steps[currentStep].icon && (
              <span className="text-xl">{steps[currentStep].icon}</span>
            )}
            <h2 className="text-lg font-bold text-[var(--foreground)]">{steps[currentStep].title}</h2>
            <span className="ml-auto text-xs text-[var(--muted)] font-mono">Step {currentStep + 1} of {steps.length}</span>
          </div>
          {children}
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onPrev}
            disabled={isFirst}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>
            Back
          </button>

          {/* Progress dots */}
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div key={i} className={`rounded-full transition-all ${i === currentStep ? 'w-5 h-2 bg-[var(--accent)]' : i < currentStep ? 'w-2 h-2 bg-[var(--accent)]/50' : 'w-2 h-2 bg-[var(--border)]'}`} />
            ))}
          </div>

          {isLast ? (
            <button
              type="button"
              onClick={onFinish}
              disabled={loading || !canNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10"/>
                  </svg>
                  Publishing…
                </>
              ) : (
                <>
                  {finishLabel}
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              disabled={!canNext}
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent)]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Next
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>
            </button>
          )}
        </div>
        </div>{/* max-w-4xl */}
      </div>
    </div>
  )
}