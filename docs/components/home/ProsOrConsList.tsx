import { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons'
import { classNames } from './classNames'

interface ProsOrConsListProps extends ComponentProps<'div'> {
  items: Readonly<string[]>
  label: string
  type: 'pro' | 'con'
}

export function ProsOrConsList({ items, label, type }: ProsOrConsListProps) {
  const pluralType = `${type}s`

  return (
    <div className={twMerge(classNames.prosOrConsContainer, classNames[`${pluralType}Container`])}>
      <div className={twMerge(classNames.prosOrConsLabel, classNames[`${pluralType}Label`])}>{label}</div>

      {items.map(item => (
        <div className={twMerge(classNames.proOrConContainer, classNames[`${type}Container`])} key={item}>
          <div className={twMerge(classNames.proOrConIcon, classNames[`${pluralType}Icon`])}>
            <FontAwesomeIcon icon={type === 'pro' ? faCheck : faXmark} />
          </div>
          {item}
        </div>
      ))}
    </div>
  )
}
