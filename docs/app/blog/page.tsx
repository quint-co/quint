import Link from 'next/link'
import { PostCard } from '../../components/blog/PostCard'
import { Layout } from 'nextra-theme-blog'
import { getPosts, getTags } from './get-posts'
import '../../style.css'

export const metadata = {
  title: 'Blog',
}
export default async function PostsPage() {
  const tags = await getTags()
  const posts = await getPosts()
  const allTags = Object.create(null)

  for (const tag of tags) {
    allTags[tag] ??= 0
    allTags[tag] += 1
  }
  return (
    <Layout>
      <div data-pagefind-ignore="all" className="max-w-3xl mx-auto px-4 py-8">
        {/* Tags Section */}
        <div className="not-prose mb-12 text-center">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Quint Blog</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {Object.entries(allTags).map(([tag, count]) => (
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

        {/* Posts Section */}
        <div className="space-y-16">
          {posts.map(post => (
            <PostCard
              key={post.route}
              route={post.route}
              title={post.title}
              excerpt={post.frontMatter.excerpt}
              date={post.frontMatter.date}
            />
          ))}
        </div>
      </div>
    </Layout>
  )
}
