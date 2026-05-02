interface Step {
  key: string
  label: string
  status: 'done' | 'active' | 'pending' | 'error'
}

interface StepProgressProps {
  steps: Step[]
}

export function StepProgress({ steps }: StepProgressProps) {
  return (
    <div className="space-y-4">
      {steps.map((step) => (
        <div key={step.key} className="flex items-center gap-3">
          <StepIcon status={step.status} />
          <span
            className={`text-sm ${
              step.status === 'active'
                ? 'text-gray-900 font-medium'
                : step.status === 'done'
                ? 'text-gray-500'
                : step.status === 'error'
                ? 'text-danger'
                : 'text-gray-300'
            }`}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  )
}

function StepIcon({ status }: { status: Step['status'] }) {
  const base = 'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0'

  if (status === 'done') {
    return (
      <div className={`${base} bg-success text-white`}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )
  }

  if (status === 'active') {
    return (
      <div className={`${base} bg-primary`}>
        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className={`${base} bg-danger text-white`}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  return (
    <div className={`${base} bg-gray-100`}>
      <div className="w-2 h-2 rounded-full bg-gray-300" />
    </div>
  )
}
