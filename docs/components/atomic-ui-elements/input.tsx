import { ComponentProps, ElementType } from 'react'

type InputProps<T extends 'input' | 'textarea'> = Omit<
  ComponentProps<T>,
  'children'
> & {
  as?: T
  variant?: keyof typeof classNamesByVariant
}

const classNamesByVariant = {
  text: `
    px-8
    py-4
    bg-white
    text-black
    rounded
  `,
}

export function Input<T extends 'input' | 'textarea' = 'input'>({
  as,
  className,
  variant = 'text',
  ...props
}: InputProps<T>) {
  const Component = (as ?? 'input') as ElementType
  return (
    <Component
      {...props}
      className={`
        ${classNamesByVariant[variant]}
        ${className}
      `}
    />
  )
}
