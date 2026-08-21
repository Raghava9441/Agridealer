import { useState, type ReactNode } from 'react'
import { Stepper } from './Stepper'
import { Button } from './Button'
import { useContent } from '@/cms/useContent'

export interface WizardStep {
  label: string
  content: ReactNode
  /** Return false (or throw) to block advancing past this step. */
  canAdvance?: () => boolean | Promise<boolean>
}

export function Wizard({ steps, onComplete }: { steps: WizardStep[]; onComplete: () => void }) {
  const [index, setIndex] = useState(0)
  const content = useContent()
  const step = steps[index]
  if (!step) return null

  const isLast = index === steps.length - 1

  const next = async () => {
    if (step.canAdvance && !(await step.canAdvance())) return
    if (isLast) {
      onComplete()
    } else {
      setIndex((i) => i + 1)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Stepper steps={steps.map((s) => s.label)} activeIndex={index} />
      <div>{step.content}</div>
      <div className="flex justify-between">
        <Button variant="secondary" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
          {content.get('common.back')}
        </Button>
        <Button onClick={() => void next()}>{isLast ? content.get('common.finish') : content.get('common.next')}</Button>
      </div>
    </div>
  )
}
