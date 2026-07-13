/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // 这些调色板映射到 CSS 变量，随 [data-theme] 在明/暗主题间切换
        primary: {
          50: 'var(--c-primary-50)',
          100: 'var(--c-primary-100)',
          200: 'var(--c-primary-200)',
          300: 'var(--c-primary-300)',
          400: 'var(--c-primary-400)',
          500: 'var(--c-primary-500)',
          600: 'var(--c-primary-600)',
          700: 'var(--c-primary-700)',
          800: 'var(--c-primary-800)',
          900: 'var(--c-primary-900)',
          950: 'var(--c-primary-950)',
        },
        gray: {
          50: 'var(--c-gray-50)',
          100: 'var(--c-gray-100)',
          200: 'var(--c-gray-200)',
          300: 'var(--c-gray-300)',
          400: 'var(--c-gray-400)',
          500: 'var(--c-gray-500)',
          600: 'var(--c-gray-600)',
          700: 'var(--c-gray-700)',
          800: 'var(--c-gray-800)',
          900: 'var(--c-gray-900)',
        },
      },
    },
  },
  plugins: [],
};
