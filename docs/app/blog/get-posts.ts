import { normalizePages } from 'nextra/normalize-pages'
import { getPageMap } from 'nextra/page-map'

export async function getPosts() {
  const { directories } = normalizePages({
    list: await getPageMap('/posts'),
    route: '/posts',
  })
  return directories
    .filter(post => post.frontMatter)
    .sort((a, b) => new Date(b.frontMatter.date).getTime() - new Date(a.frontMatter.date).getTime())
}

export async function getTags() {
  const posts = await getPosts()
  const tags = posts.flatMap(post => post.frontMatter.tags)
  return tags
}

/** External posts with the "Quint" tag (fixed list) */
export type ExternalPost = {
  title: string
  url: string
  date: string // ISO (YYYY-MM-DD)
  excerpt: string
  source: 'Informal Systems'
}

export const EXTERNAL_QUINT_POSTS: ExternalPost[] = [
  {
    title: 'Espresso HotShot Epoch Changes in Quint',
    url: 'https://informal.systems/blog/espresso-hotshot-epoch-changes-in-quint-2025',
    date: '2025-05-22',
    excerpt: 'How we used Quint to formalize Espresso’s epoch change protocol with executable specifications.',
    source: 'Informal Systems',
  },
  {
    title: 'Quint Launch Event Follow-Up Q&A and Recap',
    url: 'https://informal.systems/blog/quint-launch-event-follow-up-2025',
    date: '2025-04-01',
    excerpt: 'Recap of our Quint launch event with community Q&A covering formal methods and model checking.',
    source: 'Informal Systems',
  },
  {
    title: 'Understanding Mysticeti Consensus with Quint',
    url: 'https://informal.systems/blog/understanding-mysticeti-consensus-with-quint-2025',
    date: '2025-03-19',
    excerpt: 'How Quint transforms complex DAG consensus algorithms into interactive, testable models.',
    source: 'Informal Systems',
  },
  {
    title: 'Case Study: Formalizing Grug’s Jellyfish Merkle Tree with Quint',
    url: 'https://informal.systems/blog/jellyfish-merkle-tree-quint-2025',
    date: '2025-03-05',
    excerpt:
      'Case study on using Quint to formally specify and verify Left Curve’s Jellyfish Merkle Tree implementation.',
    source: 'Informal Systems',
  },
  {
    title: 'Quint Deserves Rust',
    url: 'https://informal.systems/blog/quint-deserves-rust',
    date: '2025-02-18',
    excerpt: "Why we're rewriting Quint’s simulator in Rust for improved performance and more comprehensive testing.",
    source: 'Informal Systems',
  },
  {
    title: "Model-Based Testing Neutron's Liquidity Pool Migration with Quint",
    url: 'https://informal.systems/blog/model-based-testing-to-secure-neutrons-liquidity',
    date: '2024-12-11',
    excerpt:
      "Using Quint for model-based testing to discover critical bugs in Neutron's $23M liquidity pool migration.",
    source: 'Informal Systems',
  },
]

export async function getExternalQuintPosts() {
  // Keeping it async so you can swap this out for a fetch later if you want.
  return EXTERNAL_QUINT_POSTS
}
