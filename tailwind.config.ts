
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        netflix: {
          red: "#E50914",
          black: "#141414",
        },
        streaming: {
          netflix: "#E50914",
          prime: "#00A8E1",
          jiostar: "#0D47A1",
          zee: "#6A0DAD",
          mxplayer: "#FF5722",
          sonyliv: "#9C27B0",
          voot: "#2196F3",
          aha: "#F44336",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      textShadow: {
        DEFAULT: '0 2px 4px rgba(0, 0, 0, 0.7)',
        md: '0 3px 6px rgba(0, 0, 0, 0.9), 0 0 5px rgba(0, 0, 0, 0.8)',
        lg: '0 4px 8px rgba(0, 0, 0, 1), 0 0 10px rgba(0, 0, 0, 0.9)',
        number: '2px 2px 0px rgba(0, 0, 0, 0.8)',
      },
      keyframes: {
        "fade-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-down": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        glow: {
          "0%, 100%": {
            boxShadow: "0 0 5px currentColor",
          },
          "50%": {
            boxShadow: "0 0 20px currentColor",
          },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out",
        "fade-down": "fade-down 0.5s ease-out",
        glow: "glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Add text-shadow plugin with enhanced shadows
    function({ addUtilities }) {
      const newUtilities = {
        '.text-shadow': {
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.7)',
        },
        '.text-shadow-md': {
          textShadow: '0 3px 6px rgba(0, 0, 0, 0.9), 0 0 5px rgba(0, 0, 0, 0.8)',
        },
        '.text-shadow-lg': {
          textShadow: '0 4px 8px rgba(0, 0, 0, 1), 0 0 10px rgba(0, 0, 0, 0.9)',
        },
        '.text-shadow-number': {
          textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)',
        },
        '.text-shadow-none': {
          textShadow: 'none',
        },
      }
      addUtilities(newUtilities)
    }
  ],
} satisfies Config;
