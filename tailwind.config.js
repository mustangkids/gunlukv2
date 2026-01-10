/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Trading Riot dark theme colors
        'tr-bg': '#0d1117',
        'tr-card': '#161b22',
        'tr-border': '#30363d',
        'tr-text': '#c9d1d9',
        'tr-muted': '#8b949e',
        'tr-green': '#3fb950',
        'tr-red': '#f85149',
        'tr-blue': '#58a6ff',
        'tr-orange': '#d29922',
        'tr-purple': '#a371f7',
        'tr-cyan': '#39c5cf',
        'tr-yellow': '#e3b341',
      },
      fontFamily: {
        mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
