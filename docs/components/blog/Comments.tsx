'use client'

import Giscus from '@giscus/react';
import { useTheme } from 'next-themes';

export const Comments = () => {
  const { setTheme: _, resolvedTheme } = useTheme()
  const theme = resolvedTheme === 'dark' ? 'noborder_dark' : 'noborder_light';

  return (
    <>
      <br/>
      <Giscus
        id="comments"
        repo="informalsystems/quint"
        repoId="MDEwOlJlcG9zaXRvcnkzNzE3MTkxMTI="
        category="Blog"
        categoryId="DIC_kwDOFif7yM4CtGJV"
        mapping="pathname"
        term="Welcome to @giscus/react component!"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme}
        lang="en"
        loading="lazy"
      />
    </>
  )
}
