/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{html,js,ts,tsx}',
  ],
  safelist: [
    {pattern: /(bg|text|border)-*./}
  ],
  mode: "jit",
  theme: {
    extend: {},
  },
  plugins: [],
}
