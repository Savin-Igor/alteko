interface FlowStep {
  label: string
  sublabel?: string
  icon: React.ReactNode
}

interface Props {
  steps: FlowStep[]
  /** 0-based index of the currently active step. If undefined, all steps are neutral. */
  activeIndex?: number
  size?: 'sm' | 'md'
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-shrink-0 text-gray-300">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="text-gray-300">
      <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function FunnelFlow({ steps, activeIndex, size = 'md' }: Props) {
  const isSmall = size === 'sm'

  function stepState(i: number): 'done' | 'active' | 'upcoming' | 'neutral' {
    if (activeIndex === undefined) return 'neutral'
    if (i < activeIndex) return 'done'
    if (i === activeIndex) return 'active'
    return 'upcoming'
  }

  const circleClass: Record<ReturnType<typeof stepState>, string> = {
    done: 'bg-success-light text-success border-success',
    active: 'bg-primary text-white border-primary',
    upcoming: 'bg-gray-100 text-gray-400 border-gray-200',
    neutral: 'bg-primary-light text-primary border-blue-100',
  }

  const labelClass: Record<ReturnType<typeof stepState>, string> = {
    done: 'text-success font-medium',
    active: 'text-primary font-semibold',
    upcoming: 'text-gray-400',
    neutral: 'text-gray-700 font-medium',
  }

  const circleSize = isSmall ? 'w-8 h-8' : 'w-10 h-10'
  const iconSize = isSmall ? 14 : 18

  return (
    <>
      {/* Desktop: horizontal */}
      <div className="hidden sm:flex items-center justify-center gap-2 flex-wrap">
        {steps.map((step, i) => {
          const state = stepState(i)
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`${circleSize} rounded-full border flex items-center justify-center flex-shrink-0 ${circleClass[state]}`}>
                  <StepIcon icon={step.icon} size={iconSize} />
                </div>
                <span className={`text-xs text-center leading-tight max-w-[80px] ${labelClass[state]}`}>
                  {step.label}
                </span>
                {step.sublabel && (
                  <span className="text-[10px] text-gray-400 text-center leading-tight max-w-[80px]">
                    {step.sublabel}
                  </span>
                )}
              </div>
              {i < steps.length - 1 && (
                <div className="mb-5">
                  <ArrowRight />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="flex sm:hidden flex-col items-center gap-0">
        {steps.map((step, i) => {
          const state = stepState(i)
          return (
            <div key={i} className="flex flex-col items-center">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full border flex items-center justify-center flex-shrink-0 ${circleClass[state]}`}>
                  <StepIcon icon={step.icon} size={16} />
                </div>
                <div>
                  <span className={`text-sm leading-tight ${labelClass[state]}`}>
                    {step.label}
                  </span>
                  {step.sublabel && (
                    <p className="text-xs text-gray-400 leading-tight">{step.sublabel}</p>
                  )}
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="my-1 self-start ml-4">
                  <ArrowDown />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

function StepIcon({ icon, size }: { icon: React.ReactNode; size: number }) {
  return (
    <span style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </span>
  )
}

// ── Shared step icon set ──────────────────────────────────────────────────────

export const STEP_ICONS = {
  bill: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <path d="M11 2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M11 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M10 13v-3m-1.5 1.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  report: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 8h8M6 11h5M6 14h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="14" cy="14" r="0.75" fill="currentColor"/>
    </svg>
  ),
  renovation: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <path d="M3 10l7-7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 8.5V16a1 1 0 0 0 1 1h3v-4h2v4h3a1 1 0 0 0 1-1V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
  vote: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <path d="M7 10l2.5 2.5L13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  contractor: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 17c0-3 2-5 5-5h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M13 13l1.5 1.5L17 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="15" cy="15" r="3" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
}
