/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        darkbg: '#090D16',
        darkcard: '#131B2E',
        darkborder: '#23304A',
      },
      fontFamily: {
        code: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
