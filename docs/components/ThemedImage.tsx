'use client'

import { useTheme } from 'next-themes'
import Image from 'next/image'

export function ThemedImage({ lightSrc, darkSrc, alt, width = 500, height = 300 }) {
  const { setTheme: _, resolvedTheme } = useTheme()

  const src = resolvedTheme === 'dark' ? darkSrc : lightSrc

  return <Image src={src} alt={alt} width={width} height={height} />
}
