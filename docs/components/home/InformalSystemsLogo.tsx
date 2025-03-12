import Image from 'next/image'
import { useTheme } from 'nextra-theme-docs'
import { useEffect, useState } from 'react'

export function InformalSystemsLogo() {
  const { resolvedTheme } = useTheme()
  const [theme, setTheme] = useState(null)
  useEffect(() => {
    setTheme(resolvedTheme)
  }, [resolvedTheme])

  return (
    <a href="https://informal.systems">
      <Image
        src={
          theme == 'dark'
            ? '/informal-systems-white.png'
            : '/informal-systems.png'
        }
        alt="Informal Systems"
        width={200}
        height={200}
      />
    </a>
  )
}
