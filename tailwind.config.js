/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        thmanyah: ['Thmanyah Text', 'sans-serif'],
        'thmanyah-text': ['Thmanyah Text', 'sans-serif'],
        'thmanyah-display': ['Thmanyah Display', 'serif'],
        sans: ['var(--app-font-text, "Thmanyah Text")', 'Thmanyah Text', 'sans-serif'],
        text: ['var(--app-font-text, "Thmanyah Text")', 'Thmanyah Text', 'sans-serif'],
        serif: ['var(--app-font-display, "Thmanyah Display")', 'Thmanyah Display', 'serif'],
        display: ['var(--app-font-display, "Thmanyah Display")', 'Thmanyah Display', 'serif'],
        amiri: ['Amiri', 'serif'],
        tajawal: ['Tajawal', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      colors: {
        cozy: {
          50: '#FAF8F5',
          100: '#F4EFE6',
          200: '#E7DEC8',
          300: '#D5C4A1',
          400: '#B89B6C',
          500: '#9C7A4A',
          600: '#7E5F36',
          700: '#5E4424',
          800: '#3F2C16',
          900: '#23180B',
        },
        obsidian: {
          50: '#27272A',
          100: '#202024',
          200: '#1A1A1E',
          300: '#161619',
          400: '#121214',
          500: '#0E0E10',
          600: '#0B0B0C',
          700: '#080809',
        },
        parchment: {
          light: '#FBF9F4',
          surface: '#FFFFFF',
          card: '#F6F2EA',
          border: '#E8E2D5',
        },
        ink: {
          primary: '#1D1A16',
          secondary: '#57524A',
          muted: '#8C857B',
        }
      },
      boxShadow: {
        'book': '0 12px 36px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.04)',
        'book-dark': '0 16px 40px -4px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(0, 0, 0, 0.5)',
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'subtle-dark': '0 4px 16px rgba(0, 0, 0, 0.45)',
        'glow-warm': '0 0 25px -5px rgba(224, 159, 62, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'page-turn-left': 'pageTurnLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'page-turn-right': 'pageTurnRight 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        pageTurnLeft: {
          '0%': { transform: 'rotateY(0deg) scale(1)', opacity: '1' },
          '50%': { transform: 'rotateY(-25deg) scale(0.97)', opacity: '0.7' },
          '100%': { transform: 'rotateY(0deg) scale(1)', opacity: '1' },
        },
        pageTurnRight: {
          '0%': { transform: 'rotateY(0deg) scale(1)', opacity: '1' },
          '50%': { transform: 'rotateY(25deg) scale(0.97)', opacity: '0.7' },
          '100%': { transform: 'rotateY(0deg) scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
