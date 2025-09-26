function getSiteUrl(): string {
  // Check for Netlify deploy preview URL
  if (process.env.DEPLOY_PRIME_URL) {
    return process.env.DEPLOY_PRIME_URL
  }

  // Check for custom site URL environment variable
  if (process.env.SITE_URL) {
    return process.env.SITE_URL
  }

  // Default to production URL
  return 'https://quint-lang.org'
}

export const SITE_CONFIG = {
  siteUrl: getSiteUrl(),
  title: 'Quint',
  description: 'Quint - A modern and executable specification language',
  lang: 'en-us',
} as const
