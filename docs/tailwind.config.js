/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'quint-purple': '#9d6ce5',
        'quint-purple-dark': '#2d0075',
        'quint-orange': '#ffab70',
      },
    },
  },
  plugins: [],
}
