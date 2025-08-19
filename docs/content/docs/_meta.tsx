import type { FC, ReactNode } from 'react'

export const Separator: FC<{ children: ReactNode }> = ({ children }) => {
  return <div className="flex items-center gap-2">{children}</div>
}

export default {
  index: {
    display: 'hidden',
  },
  _: {
    title: <Separator>Introduction</Separator>,
    type: 'separator',
  },
  why: '',
  'what-does-quint-do': '',
  'getting-started': '',
  'use-cases': '',
  faq: 'FAQ',
  '-- Writing specifications': {
    type: 'separator',
    title: 'Writing specifications',
  },
  'language-basics': '',
  lessons: '',
  'cheatsheet-link': {
    title: 'Cheatsheet ↵',
    href: '/quint-cheatsheet.pdf',
  },
  'examples-link': {
    title: 'Examples',
    href: 'https://github.com/informalsystems/quint/tree/main/examples',
  },
  '-- Using specifications': {
    type: 'separator',
    title: 'Using specifications',
  },
  'checking-properties': '',
  repl: 'Interacting with REPL',
  literate: '',
  'model-based-testing': '',
  '-- How the tools work': {
    type: 'separator',
    title: 'How the tools work',
  },
  'model-checkers': '',
  simulator: '',
  '-- Reference Documentation': {
    type: 'separator',
    title: 'Reference Documentation',
  },
  lang: 'Language Manual',
  quint: 'CLI Manual',
  builtin: 'Built-in Operators',
  '-- Development': {
    type: 'separator',
    title: 'Design & Development',
  },
  'design-principles': '',
  'development-docs': '',
}
