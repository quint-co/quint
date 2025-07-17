import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs' // nextra-theme-blog or your custom theme
// import { useMDXComponents as getBlogMDXComponents } from 'nextra-theme-blog'

// Get the default MDX components
const themeComponents = getThemeComponents()
// const blogComponents = getBlogMDXComponents()

// Merge components
export function useMDXComponents(components) {
  return {
    ...themeComponents,
    // ...blogComponents,
    ...components
  }
}
