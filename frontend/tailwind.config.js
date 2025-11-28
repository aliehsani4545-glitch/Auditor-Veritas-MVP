/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        stripe: {
          bg: '#0a2540',
          accent: '#635bff',
          cyan: '#00d4ff',
          dark: '#0f172a',
        }
      },
      animation: {
        "beam": "beam 1s linear", // Snabb ljuseffekt vid hover
        "pulse-glow": "pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "draw": "draw 4s ease-in-out infinite",
        "text-gradient": "text-gradient 5s linear infinite",
        "cursor-blink": "cursor-blink 1s step-start infinite",
        
        // --- NYA AVANCERADE ANIMATIONER ---
        "spin-slow": "spin 12s linear infinite",
        "text-shine": "text-shine 3s linear infinite", // Skimrande text
        "blob": "blob 7s infinite", // Dansande bakgrunds-blobs
      },
      keyframes: {
        beam: {
          "0%": { transform: "translateX(-100%) skewX(-15deg)" },
          "100%": { transform: "translateX(100%) skewX(-15deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.2)", filter: "brightness(1.2)" },
        },
        draw: {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
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
        
        // --- NYA KEYFRAMES ---
        "text-shine": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" } 
        },
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" }
        }
      },
    },
  },
  plugins: [],
}