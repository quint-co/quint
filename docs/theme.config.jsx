import { useTheme } from 'nextra-theme-docs'
import { useConfig } from 'nextra-theme-docs'

export default {
  logo: () => {
    const { resolvedTheme } = useTheme()
    if (resolvedTheme == "dark") {
      return (
        <img src = "https://raw.githubusercontent.com/informalsystems/quint/main/logos/quint-logo-light.svg" alt="Quint" width="150px"/>
      );
    } else {
      return (
        <img src = "https://raw.githubusercontent.com/informalsystems/quint/main/logos/quint-logo-dark.svg" alt="Quint" width="150px"/>
      );
    }
  },
  project: {
    link: 'https://github.com/informalsystems/quint'
  },
  head: function useHead() {
    const { title } = useConfig()
    return (
      <>
        <meta name="msapplication-TileColor" content="#fff" />
        <meta name="theme-color" content="#fff" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Language" content="en" />
        <meta
          name="description"
          content="A modern and exectuable specification language"
        />
        <meta
          name="og:description"
          content="A modern and exectuable specification language"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/og.png" />
        <meta name="twitter:site:domain" content="quint-lang.com" />
        <meta name="twitter:url" content="https://quint-lang.com" />
        <meta
          name="og:title"
          content={title ? title + ' – Quint' : 'Quint'}
        />
        <meta name="og:image" content="/og.png" />
        <meta name="apple-mobile-web-app-title" content="Quint" />
        <link rel="icon" href="/icon-light.png" type="image/png" />
        <link
          rel="icon"
          href="/icon-dark.png"
          type="image/png"
          media="(prefers-color-scheme: dark)"
        />
      </>
    )
  },
  primaryHue: { dark: 264, light: 264 },
  primarySaturation: { dark: 52, light: 90 },
  sidebar: {
    defaultMenuCollapseLevel: 1
  }
}
