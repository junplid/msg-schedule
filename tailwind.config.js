/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    './pages/**/*.{html,js}',
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    backgroundColor: {
      "1": "#000706",
      "2": "#00272d",
      "3": "#134647",
      "4": "#0c7e7e",
      "5": "#EBF1F2",
    }
  },
  plugins: [],
}

