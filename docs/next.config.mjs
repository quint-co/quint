import nextra from 'nextra'
import { bundledLanguages, createHighlighter } from 'shiki';
import fs from 'fs'

const quintGrammar = JSON.parse(fs.readFileSync('../vscode/quint-vscode/syntaxes/quint.tmLanguage.json', 'utf8'))
const darkTheme = JSON.parse(fs.readFileSync('./themes/dark.json', 'utf8'))
const lightTheme = JSON.parse(fs.readFileSync('./themes/light.json', 'utf8'))
let highlighter

const withNextra = nextra({
  latex: true,
  mdxOptions: {
    rehypePrettyCodeOptions: {
      theme: {
        dark: darkTheme,
        light: lightTheme
      },
      getHighlighter: options => {
        if (highlighter) {
          return highlighter
        }

        highlighter = createHighlighter({
          ...options,
          langs: [
            ...Object.values(bundledLanguages),
            // custom grammar options, see the Shiki documentation for how to provide these options
            {
              name: 'quint',
              scopeName: 'source.quint',

              embeddedLangs: [],
              ...quintGrammar
            }
          ],
          langAlias: { quint : 'Quint' },
        })

        return highlighter
      }
    }
  }
})

// export default withNextra()
export default withNextra({ output: 'export', images: { unoptimized: true } })
