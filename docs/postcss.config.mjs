// If you want to use other PostCSS plugins, see the following:
// https://tailwindcss.com/docs/using-with-preprocessors
/** @type {import('postcss').Postcss} */
export default {
  plugins: {
    '@tailwindcss/postcss': {}
  },
  theme: {
    colors: {
      'quint-purple': '#9d6ce5',
      'quint-purple-dark': '#2d0075',
      'quint-orange': '#ffab70',
    }
  }
}
