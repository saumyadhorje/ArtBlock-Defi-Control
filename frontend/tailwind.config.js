/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      extend: {
        textShadow: {
          'glow': '0 0 10px rgba(255,255,255,0.5)',
        },
      },
    },
  },
  plugins: [],
}