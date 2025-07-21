import { getPosts } from '../blog/get-posts'

const CONFIG = {
  title: 'Quint Blog',
  siteUrl: 'https://quint-lang.org',
  description: 'Stories, tutorials, and insights about Quint specifications',
  lang: 'en-us',
}

export async function GET() {
  const allPosts = await getPosts()
  const posts = allPosts
    .map(
      post => `    <item>
        <title>${post.title}</title>
        <description>${post.frontMatter.excerpt}</description>
        <link>${CONFIG.siteUrl}${post.route}</link>
        <guid isPermaLink="false">${CONFIG.siteUrl}${post.route}</guid>
        <pubDate>${new Date(post.frontMatter.date).toUTCString()}</pubDate>
    </item>`
    )
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
