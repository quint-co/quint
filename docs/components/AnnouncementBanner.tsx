'use client'

import Link from 'next/link'
import { Banner } from 'nextra/components'

export const AnnouncementBanner = () => {
  return (
    <Banner dismissible={true} storageKey="quint-llm-kit-release">
      <b>
        Try the{' '}
        <Link href="https://github.com/informalsystems/quint-llm-kit" target="_blank" rel="noopener noreferrer">
          Quint LLM Kit
        </Link>
        {' '}for extra help getting started!
      </b>
    </Banner>
  )
}
