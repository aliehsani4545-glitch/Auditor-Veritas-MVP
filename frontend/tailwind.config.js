/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stripe: {
          bg: '#0a2540',
          accent: '#635bff',
          cyan: '#00d4ff',
          dark: '#0f172a',
        }
      },
      animation: {
        "beam": "beam 8s linear infinite",
        "pulse-glow": "pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "draw": "draw 4s ease-in-out infinite",
        // NYA ANIMATIONER HÄR
        "text-gradient": "text-gradient 5s linear infinite",
        "cursor-blink": "cursor-blink 1s step-start infinite",
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
        },
        // NYA KEYFRAMES HÄR
        "text-gradient": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center"
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center"
          }
        },
        "cursor-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" }
        },
      },
    },
  },
  plugins: [],
}