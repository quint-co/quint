import { generateStaticParamsFor, importPage } from 'nextra/pages'
import type { FC } from 'react'
import { useMDXComponents as getMDXComponents } from '../../mdx-components'
import { SITE_CONFIG } from '../../config/site'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

function getPostCoverImage(mdxPath: string[]): string | null {
  // Check if this is a blog post
  if (mdxPath && mdxPath.length >= 2 && mdxPath[0] === 'posts') {
    const postName = mdxPath[1]
    return `${SITE_CONFIG.siteUrl}/blog-covers/${postName}.jpg`
  }

  return null
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params
  const { metadata } = await importPage(params.mdxPath, params.lang)

  // Add cover image for blog posts
  const coverImageUrl = getPostCoverImage(params.mdxPath)
  if (coverImageUrl) {
    return {
      ...metadata,
      openGraph: {
        ...metadata.openGraph,
        images: [{ url: coverImageUrl }],
      },
      twitter: {
        ...metadata.twitter,
        card: 'summary_large_image',
        images: [coverImageUrl],
      },
    }
  }

  return metadata
}

type PageProps = Readonly<{
  params: Promise<{
    mdxPath: string[]
    lang: string
  }>
}>

const Wrapper = getMDXComponents().wrapper

const Page: FC<PageProps> = async props => {
  const params = await props.params
  const result = await importPage(params.mdxPath, params.lang)
  const { default: MDXContent, toc, metadata } = result
  return (
    <Wrapper toc={toc} metadata={metadata}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  )
}

export default Page
