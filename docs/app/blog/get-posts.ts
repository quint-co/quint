import { normalizePages } from 'nextra/normalize-pages'
import { getPageMap } from 'nextra/page-map'

export async function getPosts() {
  const { directories } = normalizePages({
    list: await getPageMap('/blog'),
    route: '/blog'
  })
  return directories
    .filter(post => {
      console.log(post.name)
      return post.frontMatter && post.name != 'page' && post.name != 'docs' && post.name !== 'index' && post.name !== 'home' && post.name !== 'blog'
    }).map(p => {
      console.log(p)
      return p
    })
    .sort((a, b) => new Date(b.frontMatter.date) - new Date(a.frontMatter.date))
}

export async function getTags() {
  const posts = await getPosts()
  console.log(posts)
  const tags = posts.flatMap(post => post.frontMatter.tags)
  return tags
}
