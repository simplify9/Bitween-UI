/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './index.html',
        './src/**/*.{html,js,ts,tsx}',
    ],
    safelist: [
        // {pattern: /(bg-blue|text-blue|border-blue)-*./}
    ],
    mode: "jit",
    theme: {
        extend: {},
    },
    plugins: [],
}
