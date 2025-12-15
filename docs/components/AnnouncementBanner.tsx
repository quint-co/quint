'use client'

import Link from 'next/link'
import { Banner } from 'nextra/components'

export const AnnouncementBanner = () => {
  return (
    <Banner dismissible={true} storageKey="quint-connect-release">
      <b>
        We launched{' '}
        <Link href="https://github.com/informalsystems/quint-connect" target="_blank" rel="noopener noreferrer">
          Quint Connect
        </Link>
        , a library for Model-Based Testing in Rust!
      </b>
    </Banner>
  )
}
