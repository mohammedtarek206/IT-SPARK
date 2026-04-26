import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          dark: 'var(--primary-dark)',
          light: '#3385ff',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          dark: '#00cc6e',
          light: '#33ffaa',
        },
        dark: {
          DEFAULT: 'var(--background)',
          light: 'var(--surface)',
        },
        surface: 'var(--surface)',
        card: 'var(--card)',
        border: 'var(--border)',
      },
      fontFamily: {
        arabic: ['Cairo', 'sans-serif'],
        english: ['Poppins', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
