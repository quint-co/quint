'use client'

import Image from 'next/image'

export function ThemedImage({ lightSrc, darkSrc, alt, width = 500, height = 300 }) {
  return (
    <>
      <Image src={lightSrc} alt={alt} width={width} height={height} className="dark:hidden" />
      <Image src={darkSrc} alt={alt} width={width} height={height} className="hidden dark:block" />
    </>
  )
}
