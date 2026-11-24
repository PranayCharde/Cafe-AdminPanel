/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#b85c1f", // Rich Roasted Coffee Brown
          50: "#fdf8f4",
          100: "#faede3",
          200: "#f5d9c2",
          500: "#b85c1f",
          600: "#a35017",
          700: "#863e10",
          800: "#6e3312",
        },
        secondary: {
          DEFAULT: "#436f56", // Sage/Matcha Green
          50: "#f2f7f4",
          100: "#e2ede6",
          500: "#436f56",
          600: "#345743",
        },
        accent: {
          DEFAULT: "#ea8e47", // Warm Caramel / Latte Art
          50: "#fef6ee",
          500: "#ea8e47",
          600: "#d97706",
        },
        cafe: {
          bg: "#faf7f2",       // Warm creamy off-white background
          card: "#ffffff",     // Crisp white cards
          border: "#ebdccd",   // Soft warm coffee-toned border
          bean: "#2e241f",     // Deep dark roasted bean text
          muted: "#786c65",    // Coffee gray-brown muted text
          cream: "#f5efe6",    // Soft cream accent
        },
      },
      fontFamily: {
        display: ["'Architects Daughter'", "'Outfit'", "cursive", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'Fira Code'", "monospace"],
      },
      boxShadow: {
        card: "0 2px 8px -2px rgba(46, 36, 31, 0.05), 0 1px 4px -1px rgba(46, 36, 31, 0.03)",
        elevated: "0 10px 25px -5px rgba(46, 36, 31, 0.08), 0 8px 10px -6px rgba(46, 36, 31, 0.04)",
      },
    },
  },
  plugins: [],
};
