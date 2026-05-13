/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'noir-bg': '#0d1117',
        'neon-cyan': '#00f2ff',
        'neon-pink': '#ff0055',
      },
      boxShadow: {
        'neon-cyan': '0 0 10px rgba(0, 242, 255, 0.5)',
        'neon-pink': '0 0 10px rgba(255, 0, 85, 0.5)',
      }
    },
  },
  plugins: [],
}