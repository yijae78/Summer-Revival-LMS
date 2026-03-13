'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

import { StepWelcome } from './StepWelcome'
import { StepSupabaseSignup } from './StepSupabaseSignup'
import { StepCreateProject } from './StepCreateProject'
import { StepEnterCredentials } from './StepEnterCredentials'
import { StepRunSQL } from './StepRunSQL'
import { StepComplete } from './StepComplete'

const STEPS = [
  { label: '환영' },
  { label: '가입' },
  { label: '프로젝트' },
  { label: '연결' },
  { label: 'SQL' },
  { label: '완료' },
]

export function SetupWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [supabaseUrl, setSupabaseUrl] = useState('')

  function goNext() {
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  function goBack() {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 py-8">
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-1">
        {STEPS.map((step, index) => (
          <div key={step.label} className="flex items-center">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors',
                index < currentStep && 'bg-primary text-primary-foreground',
                index === currentStep && 'bg-primary text-primary-foreground',
                index > currentStep && 'bg-muted text-muted-foreground'
              )}
            >
              {index < currentStep ? (
                <Check className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-1 h-0.5 w-6 transition-colors',
                  index < currentStep ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">
        {currentStep === 0 && <StepWelcome onNext={goNext} />}
        {currentStep === 1 && (
          <StepSupabaseSignup onNext={goNext} onBack={goBack} />
        )}
        {currentStep === 2 && (
          <StepCreateProject onNext={goNext} onBack={goBack} />
        )}
        {currentStep === 3 && (
          <StepEnterCredentials
            onNext={goNext}
            onBack={goBack}
            onUrlSet={setSupabaseUrl}
          />
        )}
        {currentStep === 4 && (
          <StepRunSQL
            onNext={goNext}
            onBack={goBack}
            supabaseUrl={supabaseUrl}
          />
        )}
        {currentStep === 5 && <StepComplete />}
      </div>
    </div>
  )
}
