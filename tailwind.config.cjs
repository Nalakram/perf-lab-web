/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: "#00f5ff",
          magenta: "#ff00aa",
          violet: "#8b00ff",
        },
      },
    },
  },
  plugins: [],
}