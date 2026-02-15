/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Graphik', 'sans-serif'],
      serif: ['Merriweather', 'serif'],
    },
    extend: {
      colors: {
        bg: "#000000",
        accent: "#F72798",    // Pink
        secondary: "#F57D1F", // Orange
        highlight: "#EBF400", // Yellow
      },
    }
  },
  plugins: [],
}
