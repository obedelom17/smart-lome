export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'Menlo', 'Consolas', 'monospace']
      }
    }
  },
  plugins: []
}
