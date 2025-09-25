import Link from 'next/link'
import { PostCard } from '../../components/blog/PostCard'
import { Layout } from 'nextra-theme-blog'
import { getExternalQuintPosts, getPosts, getTags } from './get-posts'
import '../../style.css'

export const metadata = { title: 'Quint Blog' }
export const dynamic = 'force-static'
export async function generateStaticParams() {
  return []
}

export default async function PostsPage() {
  const tags = await getTags()
  const posts = await getPosts()
  const externalQuint = await getExternalQuintPosts()

  const allTags: Record<string, number> = Object.create(null)
  for (const tag of tags) allTags[tag] = (allTags[tag] ?? 0) + 1

  return (
    <Layout>
      <div data-pagefind-ignore="all" className="max-w-3xl mx-auto px-4 py-8">
        {/* Tags */}
        <div className="not-prose mb-12 text-center">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Quint Blog</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {Object.entries(allTags).map(([tag, count]: [string, number]) => (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-sm font-medium transition-colors"
              >
                {tag} <span className="text-gray-500 dark:text-gray-400">({count})</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Local posts */}
        <div className="space-y-16">
          {posts.map(post => (
            <PostCard
              key={post.route}
              route={post.route}
              title={post.title}
              excerpt={post.frontMatter.excerpt}
              date={post.frontMatter.date}
              coverImage={post.coverImage}
            />
          ))}
        </div>

        {/* External posts (Quint tag) */}
        <div className="mt-20">
          <h3 className="text-xl text-center font-semibold mb-6 text-gray-800 dark:text-gray-100">
            Quint Posts on the Informal Systems Blog
          </h3>
          <ul className="space-y-6">
            {externalQuint.map(post => (
              <PostCard key={post.url} route={post.url} title={post.title} excerpt={post.excerpt} date={post.date} />
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  )
}
