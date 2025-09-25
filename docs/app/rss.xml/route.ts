import { getPosts } from '../blog/get-posts'
import { SITE_CONFIG } from '../../config/site'

const CONFIG = {
  title: 'Quint Blog',
  siteUrl: SITE_CONFIG.siteUrl,
  description: 'Stories, tutorials, and insights about Quint specifications',
  lang: SITE_CONFIG.lang,
}

function getPostCoverImage(postRoute: string): string {
  // Extract post name from route (e.g., "/posts/soup" -> "soup")
  const postName = postRoute.split('/').pop()
  return postName ? `${postName}.jpg` : ''
}

export async function GET() {
  const allPosts = await getPosts()
  const posts = allPosts
    .map(post => {
      const coverImage = getPostCoverImage(post.route)
      const imageUrl = coverImage ? `${CONFIG.siteUrl}/blog-covers/${coverImage}` : ''

      return `    <item>
        <title>${post.title}</title>
        <description>${post.frontMatter.excerpt}</description>
        <link>${CONFIG.siteUrl}${post.route}</link>
        <guid isPermaLink="false">${CONFIG.siteUrl}${post.route}</guid>
        <pubDate>${new Date(post.frontMatter.date).toUTCString()}</pubDate>${
        imageUrl
          ? `
        <enclosure url="${imageUrl}" type="image/jpeg"/>`
          : ''
      }
    </item>`
    })
    .join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${CONFIG.title}</title>
    <link>${CONFIG.siteUrl}</link>
    <description>${CONFIG.description}</description>
    <language>${CONFIG.lang}</language>
${posts}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml',
    },
  })
}
