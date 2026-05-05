/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './index.html',
        './src/**/*.{html,js,ts,tsx}',
    ],
    // safelist: [
    //     {pattern: /(bg-primary)-*./}
    // ],
    mode: "jit",
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary-400": "#fd7b6c",
                "primary-300": "#ffaba2",
                "primary-200": "#ffcec8",
                "primary-100": "#ffe4e1",
                "primary-50": "#fef3f2",
                "primary-500": "#f6503d",
                "primary-600": "#e3311d",
                "primary-700": "#bf2716",
                "primary-800": "#9e2416",
                "primary-900": "#832419",
                "primary-green":"#48BB78"
            },
            keyframes: {
                progress: {
                    '0%':   { width: '0%',   marginLeft: '0%' },
                    '50%':  { width: '60%',  marginLeft: '20%' },
                    '100%': { width: '0%',   marginLeft: '100%' },
                },
            },
            animation: {
                progress: 'progress 1.2s ease-in-out infinite',
            },
        },
    },
    plugins: [],
}
