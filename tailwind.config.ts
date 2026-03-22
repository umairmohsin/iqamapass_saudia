import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#f6efe4",
        ink: "#1f1a17",
        sand: "#eadbc6",
        clay: "#d18c63",
        forest: "#356859",
        amber: "#cc8b19",
        danger: "#9f2d2d",
        muted: "#7b6d62"
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        urdu: ["var(--font-urdu)"]
      },
      boxShadow: {
        card: "0 20px 40px -24px rgba(31, 26, 23, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
