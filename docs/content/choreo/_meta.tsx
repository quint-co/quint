import type { FC, ReactNode } from 'react'

export const Separator: FC<{ children: ReactNode }> = ({ children }) => {
  return <div className="flex items-center gap-2">{children}</div>
}

export default {
  index: 'What is Choreo?',
  tutorial: 'Tutorial',
  'cue-pattern': 'Using Cues',
  'custom-effects-extensions': 'Custom Effects and Environment Extensions',
  'step-micro': 'Micro steps',
}
