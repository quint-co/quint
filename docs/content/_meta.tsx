import type { MetaRecord } from 'nextra'
import { LinkArrowIcon } from 'nextra/icons'
import type { FC, ReactNode } from 'react'
import { useMDXComponents } from '../mdx-components'

export default {
  index: {
    type: 'page',
    theme: {
      layout: 'full',
      toc: false,
    },
  },
  docs: {
    type: 'page',
    title: 'Documentation',
  },
  blog: {
    type: 'page',
    theme: {
      typesetting: 'article',
      toc: false
    }
  },
  community: {
    type: 'page',
    title: 'Community',
  },
}
