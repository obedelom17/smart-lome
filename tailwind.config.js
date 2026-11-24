export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { forest: { 950: '#06120d', 900: '#0a1f16', 800: '#1a3c2e', 700: '#2d6a4f' }, gold: '#e8a317', mint: '#52e0a0' },
      fontFamily: { sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'], mono: ['"JetBrains Mono"', 'monospace'] }
    }
  },
  plugins: []
}
