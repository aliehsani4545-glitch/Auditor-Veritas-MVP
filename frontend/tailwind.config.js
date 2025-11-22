/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html", // Viktigt för Vite
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stripe: {
          bg: '#0a2540',     // Den klassiska mörkblå bakgrunden
          accent: '#635bff', // Stripe lila
          cyan: '#00d4ff',   // Glödande cyan
          dark: '#0f172a',
        }
      },
      animation: {
        "beam": "beam 8s linear infinite",
        "pulse-glow": "pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "draw": "draw 4s ease-in-out infinite",
      },
      keyframes: {
        beam: {
          "0%": { transform: "translateX(-100%) translateY(-100%)" },
          "100%": { transform: "translateX(100%) translateY(100%)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.2)", filter: "brightness(1.2)" },
        },
        draw: {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        }
      },
    },
  },
  plugins: [],
}