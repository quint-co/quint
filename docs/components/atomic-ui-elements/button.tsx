import { ComponentProps, ElementType, ReactNode } from 'react'

type ButtonProps<T extends 'a' | 'button'> = ComponentProps<T> & {
  children: ReactNode
  as?: T
  variant?: keyof typeof classNamesByVariant
}

const classNamesByVariant = {
  primary: `
    border-2
    border-quint-purple
    bg-quint-purple
    text-white
    hover:bg-quint-purple-dark
    hover:text-quint-purple
    px-8
    py-3
  `,
  secondary: `
    border-2
    border-quint-purple
    text-quint-purple
    hover:bg-quint-purple/10
    hover:border-quint-purple-dark
    hover:text-quint-purple-dark
    px-8
    py-3
  `,
}

export function Button<T extends 'a' | 'button'>({
  as,
  children,
  className,
  variant = 'primary',
  ...props
}: ButtonProps<T>) {
  const Component = (as ?? 'button') as ElementType
  return (
    <Component
      {...props}
      role="button"
      className={`
        inline-flex
        text-lg
        font-bold
        transition-all
        duration-200
        rounded
        font-pj
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        focus:ring-gray-900
        ${classNamesByVariant[variant]}
        ${className}
      `}
    >
      {children}
    </Component>
  )
}
