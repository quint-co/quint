import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import Script from 'next/script'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import { InformalSystemsLogo } from '../components/home/InformalSystemsLogo'
import '../style.css'

export const metadata = {
  title: 'Quint',
  description: 'Quint - A modern and executable specification language',
  openGraph: {
    images: [{ url: 'https://quint-lang.org/og.jpg' }],
    url: 'https://quint-lang.org',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@informalsystems',
    images: ['https://quint-lang.org/og.jpg'],
  },
}

const QuintLogo = () => {
  return (
    <>
      <img
        src="https://raw.githubusercontent.com/informalsystems/quint/main/logos/quint-logo-dark.svg"
        alt="Quint"
        width="150px"
        className="dark:hidden"
      />
      <img
        src="https://raw.githubusercontent.com/informalsystems/quint/main/logos/quint-logo-light.svg"
        alt="Quint"
        width="150px"
        className="hidden dark:block"
      />
    </>
  )
}

const navbar = (
  <Navbar
    logo={<QuintLogo />}
    logoLink="/"
    projectLink="https://github.com/informalsystems/quint"
    chatLink="https://t.me/quint_lang"
    chatIcon={
      <svg width="24" height="24" viewBox="0 0 50 50">
        <path
          fill="currentColor"
          d="M46.137,6.552c-0.75-0.636-1.928-0.727-3.146-0.238l-0.002,0C41.708,6.828,6.728,21.832,5.304,22.445	c-0.259,0.09-2.521,0.934-2.288,2.814c0.208,1.695,2.026,2.397,2.248,2.478l8.893,3.045c0.59,1.964,2.765,9.21,3.246,10.758	c0.3,0.965,0.789,2.233,1.646,2.494c0.752,0.29,1.5,0.025,1.984-0.355l5.437-5.043l8.777,6.845l0.209,0.125	c0.596,0.264,1.167,0.396,1.712,0.396c0.421,0,0.825-0.079,1.211-0.237c1.315-0.54,1.841-1.793,1.896-1.935l6.556-34.077	C47.231,7.933,46.675,7.007,46.137,6.552z M22,32l-3,8l-3-10l23-17L22,32z"
        />
      </svg>
    }
  />
)

const footer = (
  <Footer>
    <div className="flex w-full flex-col sm:flex-row gap-6 items-center justify-between">
      <div className="flex flex-col sm:items-start items-center">
        <InformalSystemsLogo />
        <p className="mt-6 text-xs">© {new Date().getFullYear()} Informal Systems.</p>
      </div>

      <div className="flex gap-6">
        <a href="https://www.iubenda.com/privacy-policy/80583341" title="Privacy Policy" data-iub-container={true}>
          Privacy Policy
        </a>
        <a
          href="https://www.iubenda.com/privacy-policy/80583341/cookie-policy"
          title="Cookie Policy"
          data-iub-container={true}
        >
          Cookie Policy
        </a>
      </div>
    </div>
  </Footer>
)

export default async function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head
        color={{
          hue: { dark: 264, light: 264 },
          saturation: { dark: 52, light: 90 },
        }}
      >
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Language" content="en" />
        <link rel="icon" href="/icon-light.png" type="image/png" />
        <link rel="icon" href="/icon-dark.png" type="image/png" media="(prefers-color-scheme: dark)" />
      </Head>
      <body>
        <Layout
          navbar={navbar}
          footer={footer}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/informalsystems/quint/blob/main/docs"
          sidebar={{
            defaultMenuCollapseLevel: 1,
            toggleButton: true,
          }}
        >
          {children}
        </Layout>
        <Script
          id="google-analytics"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || []
              function gtag(){dataLayer.push(arguments)}
              gtag('js', new Date())
              gtag('config', 'G-HD6HX8DTXE')
            `,
          }}
        />
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-HD6HX8DTXE" />
      </body>
      <Script strategy="afterInteractive" src="https://cdn.iubenda.com/iubenda.js" />
    </html>
  )
}
