'use client'

import Image from 'next/image'
import { useTheme } from 'next-themes'

export function InformalSystemsLogo() {
  const { setTheme: _, resolvedTheme } = useTheme()
  const isDark = resolvedTheme == 'dark'

  return (
    <a href="https://informal.systems">
      <Image
        src={isDark ? '/informal-systems-white.png' : '/informal-systems.png'}
        alt="Informal Systems"
        width={200}
        height={200}
      />
    </a>
  )
}
