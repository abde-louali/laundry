/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        laundry: {
          primary: '#1565C0',
          'primary-light': '#1E88E5',
          accent: '#00ACC1',
          background: '#F0F4F8',
          surface: '#FFFFFF',
          'sidebar-bg': '#1A237E',
          'sidebar-text': '#E3F2FD',
          'text-primary': '#1A1A2E',
          'text-secondary': '#546E7A',
          'text-muted': '#90A4AE',
          success: '#2E7D32',
          'success-light': '#E8F5E9',
          warning: '#F57F17',
          'warning-light': '#FFFDE7',
          error: '#C62828',
          'error-light': '#FFEBEE',
          border: '#E0E7EF',
        }
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.08)',
        'card-hover': '0 6px 20px rgba(0,0,0,0.12)',
        'sidebar': '4px 0 20px rgba(0,0,0,0.15)',
        'modal': '0 20px 60px rgba(0,0,0,0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}