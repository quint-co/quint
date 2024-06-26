const { getHighlighter, BUNDLED_LANGUAGES } = require('shiki')

const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.jsx',
  latex: true,
  mdxOptions: {
    rehypePrettyCodeOptions: {
      getHighlighter: options => {
        return getHighlighter({
          ...options,
          langs: [
            ...BUNDLED_LANGUAGES,
            // custom grammar options, see the Shiki documentation for how to provide these options
            {
              id: 'quint',
              scopeName: 'source.quint',
              aliases: ['qnt'], // Along with id, aliases will be included in the allowed names you can use when writing markdown.
              path: '../../../vscode/quint-vscode/syntaxes/quint.tmLanguage.json'
            }
          ]
        })
      }
    }
  }
})

module.exports = withNextra()
module.exports = withNextra({ output: 'export', images: { unoptimized: true } })
