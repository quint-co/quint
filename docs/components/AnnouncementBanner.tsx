'use client'

import Link from 'next/link'
import { Banner } from 'nextra/components'

export const AnnouncementBanner = () => {
  return (
    <Banner dismissible={true} storageKey="choreo-release">
      <b>
        🎉 Listen to the Choreo's{' '}
        <Link href="http://bit.ly/3Kne3iR" target="_blank" rel="noopener noreferrer">
          launch event on Sep 23rd
        </Link>
      </b>
    </Banner>
  )
}
