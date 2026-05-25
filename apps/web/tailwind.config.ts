import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          DEFAULT: '#f97316',
          dark: '#ea580c',
          darker: '#c2410c',
          darkest: '#9a3412',
          light: '#fb923c',
          lighter: '#fdba74',
          lightest: '#fed7aa',
        },
      },
    },
  },
  plugins: [],
};

export default config;
