import { ComponentProps, ElementType } from 'react'

type ButtonProps<T extends 'a' | 'button'> = ComponentProps<T> & {
  children: React.ReactNode
  as?: T
  variant?: keyof typeof classNamesByVariant
}

const classNamesByVariant = {
  primary: `
    bg-quint-purple
    text-white
    hover:bg-[#2d0075]
    hover:text-quint-purple
    px-8
    py-4
  `,
  secondary: `
    bg-quint-purple
    text-white
    hover:bg-[#2d0075]
    hover:text-quint-purple
    px-6
    py-2
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
