/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'iotrix-dark': '#02182b',
                'iotrix-darker': '#021d35',
                'iotrix-red': '#ff3131',
            }
        },
    },
    plugins: [],
}