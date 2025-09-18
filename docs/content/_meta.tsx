export default {
  index: {
    type: 'page',
    title: 'Home',
    theme: {
      layout: 'full',
      toc: false,
    },
  },
  docs: {
    type: 'page',
    title: 'Documentation',
  },
  choreo: {
    type: 'page',
    title: <span className="badge-new">Choreo</span>,
  },
  blog: {
    type: 'page',
    href: '/blog',
    title: 'Blog',
  },
  community: {
    type: 'page',
    title: 'Community',
  },
  posts: {
    display: 'hidden',
  }
}
