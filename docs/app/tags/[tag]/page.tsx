import { Layout } from 'nextra-theme-blog'
import { getPosts, getTags } from '../../blog/get-posts'
import { PostCard } from '../../../components/blog/PostCard'
import '../../../style.css'

export async function generateMetadata(props) {
  const params = await props.params
  return {
    title: `Posts Tagged with "${decodeURIComponent(params.tag)}"`
  }
}

export async function generateStaticParams() {
  const allTags = await getTags()
  return [...new Set(allTags)].map(tag => ({ tag }))
}

export default async function TagPage(props) {
  const params = await props.params
  const { title } = await generateMetadata({ params })
  const posts = await getPosts()
  return (
    <Layout>
      <div data-pagefind-ignore="all" className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">{title}</h2>
      <div className="space-y-16">
      {posts
        .filter(post =>
          post.frontMatter.tags.includes(decodeURIComponent(params.tag))
        )
        .map(post => (
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
