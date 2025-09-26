import { normalizePages } from 'nextra/normalize-pages'
import { getPageMap } from 'nextra/page-map'

function getPostCoverImage(postRoute: string): string {
  // Extract post name from route (e.g., "/posts/soup" -> "soup")
  const postName = postRoute.split('/').pop()
  return postName ? `/blog-covers/${postName}.jpg` : ''
}

export async function getPosts() {
  const { directories } = normalizePages({
    list: await getPageMap('/posts'),
    route: '/posts',
  })
  return directories
    .filter(post => post.frontMatter)
    .map(post => ({
      ...post,
      coverImage: getPostCoverImage(post.route),
    }))
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
  coverImage?: string
}

export const EXTERNAL_QUINT_POSTS: ExternalPost[] = [
  {
    title: 'Espresso HotShot Epoch Changes in Quint',
    url: 'https://informal.systems/blog/espresso-hotshot-epoch-changes-in-quint-2025',
    date: '2025-05-22',
    excerpt: "How we used Quint to formalize Espresso's epoch change protocol with executable specifications.",
    source: 'Informal Systems',
    coverImage: 'https://images.ctfassets.net/p79kctcd7ahy/3atNFg4gvdds7JvY8fbUwk/cee83a26b4d8e2ee327b8faad1476807/Cover_Quint_EspressoHotShot.jpg',
  },
  {
    title: 'Quint Launch Event Follow-Up Q&A and Recap',
    url: 'https://informal.systems/blog/quint-launch-event-follow-up-2025',
    date: '2025-04-01',
    excerpt: 'Recap of our Quint launch event with community Q&A covering formal methods and model checking.',
    source: 'Informal Systems',
    coverImage: 'https://images.ctfassets.net/p79kctcd7ahy/15iM9qxy7v9lW7yXMBcgGi/5f1f6f68736a246c064916545ea58f1b/Cover_Quint_Launch.jpg',
  },
  {
    title: 'Understanding Mysticeti Consensus with Quint',
    url: 'https://informal.systems/blog/understanding-mysticeti-consensus-with-quint-2025',
    date: '2025-03-19',
    excerpt: 'How Quint transforms complex DAG consensus algorithms into interactive, testable models.',
    source: 'Informal Systems',
    coverImage: 'https://images.ctfassets.net/p79kctcd7ahy/4j3TyRefZGi9A92s1hATUH/768aaf1adee326a8337dfe4566cc690f/Cover_Quint_MysticetiConsensus.jpg',
  },
  {
    title: "Case Study: Formalizing Grug's Jellyfish Merkle Tree with Quint",
    url: 'https://informal.systems/blog/jellyfish-merkle-tree-quint-2025',
    date: '2025-03-05',
    excerpt:
      "Case study on using Quint to formally specify and verify Left Curve's Jellyfish Merkle Tree implementation.",
    source: 'Informal Systems',
    coverImage: 'https://images.ctfassets.net/p79kctcd7ahy/4U4Q1VSS5v5KJCgscIqlEK/d74b431fce035d5ffd2f1c56c1f735bb/Cover_Quint_JellyfishMerkleTree.jpg',
  },
  {
    title: 'Quint Deserves Rust',
    url: 'https://informal.systems/blog/quint-deserves-rust',
    date: '2025-02-18',
    excerpt: "Why we're rewriting Quint's simulator in Rust for improved performance and more comprehensive testing.",
    source: 'Informal Systems',
    coverImage: 'https://images.ctfassets.net/p79kctcd7ahy/6xw7ScvPz7Yam0Rj3mHsIk/79b1cbce94703007510078030bdb14c3/Cover_Quint_Rust.jpg',
  },
  {
    title: "Model-Based Testing Neutron's Liquidity Pool Migration with Quint",
    url: 'https://informal.systems/blog/model-based-testing-to-secure-neutrons-liquidity',
    date: '2024-12-11',
    excerpt:
      "Using Quint for model-based testing to discover critical bugs in Neutron's $23M liquidity pool migration.",
    source: 'Informal Systems',
    coverImage: 'https://images.ctfassets.net/p79kctcd7ahy/39KTSqOffgh6X8o1arlNM3/92501a6d14c735e409d56fb48e445217/Cover_Quint_NeutronLiquidity.jpg',
  },
]

export async function getExternalQuintPosts() {
  // Keeping it async so you can swap this out for a fetch later if you want.
  return EXTERNAL_QUINT_POSTS
}
