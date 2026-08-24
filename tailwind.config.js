/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Warm brass accent used across the site
        sand: {
          DEFAULT: "#C9A96A",
          soft: "#D9C39A",
          deep: "#8F7A4E",
        },
        ink: {
          DEFAULT: "#07070b",
          soft: "#0d0d13",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: {
        display: "-0.03em",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scroll-cue": {
          "0%": { opacity: "0", transform: "translateY(-60%)" },
          "40%": { opacity: "1" },
          "100%": { opacity: "0", transform: "translateY(160%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 1.2s ease both",
        "scroll-cue": "scroll-cue 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
