/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Dynamic gradient classes from DB (location cards, etc.)
    { pattern: /^from-/ },
    { pattern: /^to-/ },
    { pattern: /^via-/ },
    { pattern: /^bg-gradient-/ },
    // Dynamic color classes from admin
    { pattern: /^text-(red|green|blue|yellow|orange|purple|pink|gray|slate|zinc|stone|amber|lime|emerald|teal|cyan|sky|indigo|violet|fuchsia|rose)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /^bg-(red|green|blue|yellow|orange|purple|pink|gray|slate|zinc|stone|amber|lime|emerald|teal|cyan|sky|indigo|violet|fuchsia|rose)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /^border-(red|green|blue|yellow|orange|purple|pink|gray|slate|zinc|stone|amber|lime|emerald|teal|cyan|sky|indigo|violet|fuchsia|rose)-(50|100|200|300|400|500|600|700|800|900)/ },
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0A0A0A',
          DEFAULT: '#0A0A0A',
          bg: '#121316',
          deep: '#000000',
          accent: '#C7CBD1',
          'accent-alt': '#9AA0A8',
          mint: '#F3F4F5',
          text: '#0A0A0A',
          muted: '#5B5F66',
          border: '#E3E4E7',
          silver: '#AFB4BB',
          'silver-light': '#F1F2F4',
          'silver-dark': '#7C818A',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-in': 'slideIn 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s infinite',
        'marquee': 'marquee 25s linear infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.16)',
        premium: '0 2px 16px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
};
