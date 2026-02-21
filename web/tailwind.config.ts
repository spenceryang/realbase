import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: {
          blue: "#0052FF",
          dark: "#0A0B0D",
        },
      },
    },
  },
  plugins: [],
};

export default config;
