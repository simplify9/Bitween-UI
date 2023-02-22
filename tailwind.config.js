/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './index.html',
        './src/**/*.{html,js,ts,tsx}',
    ],
    safelist: [
        {pattern: /(bg|text|border|h)-*./}
    ],
    mode: "jit",
    theme: {
        extend: {},
    },
    plugins: [],
}
