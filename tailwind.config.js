export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#10B981',
        dark: {
          bg: '#0F172A',
          surface: '#1E293B',
          border: '#334155'
        },
        light: {
          bg: '#FFFFFF',
          surface: '#F8FAFC',
          border: '#E2E8F0'
        }
      },
      backgroundColor: {
        dark: '#0F172A',
        'dark-surface': '#1E293B'
      },
      textColor: {
        dark: '#E2E8F0',
        'dark-secondary': '#94A3B8'
      },
      animation: {
        'pulse-border': 'pulse-border 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sound-wave': 'sound-wave 0.6s ease-in-out infinite',
        'blink': 'blink 1s step-start infinite',
        'fadeIn': 'fadeIn 0.3s ease-in-out',
        'slideDown': 'slideDown 0.3s ease-out'
      },
      keyframes: {
        'pulse-border': {
          '0%, 100%': { borderColor: 'rgba(59, 130, 246, 0.5)' },
          '50%': { borderColor: 'rgba(59, 130, 246, 1)' }
        },
        'sound-wave': {
          '0%, 100%': { height: '0.5rem' },
          '50%': { height: '1.5rem' }
        },
        'blink': {
          '0%, 49%, 100%': { opacity: '1' },
          '50%, 99%': { opacity: '0' }
        },
        'fadeIn': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'slideDown': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    }
  },
  plugins: []
}
