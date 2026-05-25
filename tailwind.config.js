/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#faf8f4',
        surface: '#ffffff',
        'surface-2': '#f3eee5',
        ink: '#1a1814',
        'ink-soft': '#4a4640',
        'ink-mute': '#8a857c',
        line: '#e5dfd2',
        accent: '#b4530a',
        'accent-soft': '#f0d4b8',
        'house-a': '#2d6a4f',
        'house-a-soft': '#c8e0d2',
        'house-b': '#6a4a8c',
        'house-b-soft': '#d8c8e6',
        good: '#2d6a4f',
        bad: '#9a3412',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
