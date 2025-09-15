'use client'

import { usePathname } from 'next/navigation'

const QuintLogo = () => {
  return (
    <>
      <img
        src="https://raw.githubusercontent.com/informalsystems/quint/main/logos/quint-logo-dark.svg"
        alt="Quint"
        width="150px"
        className="dark:hidden"
      />
      <img
        src="https://raw.githubusercontent.com/informalsystems/quint/main/logos/quint-logo-light.svg"
        alt="Quint"
        width="150px"
        className="hidden dark:block"
      />
    </>
  )
}

const ChoreoLogo = () => {
  return (
    <>
      <img src="/choreo-logo-dark.png" alt="Choreo" width="150px" className="dark:hidden" />
      <img src="/choreo-logo-light.png" alt="Choreo" width="150px" className="hidden dark:block" />
    </>
  )
}

export const LogoSwitcher = () => {
  const pathname = usePathname()
  const isChoreoPage = pathname?.startsWith('/choreo')

  return isChoreoPage ? <ChoreoLogo /> : <QuintLogo />
}
