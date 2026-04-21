/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#fdfbf7",
        foreground: "#2d2d2d",
        muted: "#e5e0d8",
        accent: "#ff4d4d",
        border: "#2d2d2d",
        "secondary-accent": "#2d5da1",
      },
      fontFamily: {
        headline: ["Kalam", "cursive"],
        body: ["Patrick Hand", "cursive"],
        label: ["Patrick Hand", "cursive"]
      },
      borderRadius: {
        "wobbly": "255px 15px 225px 15px / 15px 225px 15px 255px",
        "wobblyMd": "15px 225px 15px 255px / 255px 15px 225px 15px",
        "wobblyLg": "355px 25px 225px 25px / 25px 225px 25px 355px",
      },
      boxShadow: {
        "hard": "4px 4px 0px 0px #2d2d2d",
        "hard-hover": "2px 2px 0px 0px #2d2d2d",
        "hard-emphasized": "8px 8px 0px 0px #2d2d2d",
        "subtle": "3px 3px 0px 0px rgba(45, 45, 45, 0.1)",
      }
    },
  },
  plugins: [],
}
