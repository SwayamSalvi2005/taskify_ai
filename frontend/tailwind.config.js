/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      // our custom dark color palette
      colors: {
        dark: {
          bg: '#0B1120',      // main background
          card: '#111827',    // card backgrounds
          hover: '#1E293B',   // hover states
          border: '#1E293B',  // borders
          light: '#1F2937',   // lighter panels
        },
        blue: {
          primary: '#3B82F6', // primary blue button
          glow: '#2563EB',    // glow effects
        }
      }
    },
  },
  plugins: [],
}
