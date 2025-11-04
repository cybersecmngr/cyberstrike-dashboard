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
        // CyberStrike Custom Colors
        'neon-green': {
          DEFAULT: '#00FF41',
          dark: '#00C832',
        },
        'cyber-blue': {
          DEFAULT: '#00D4FF',
          dark: '#0099CC',
        },
        'danger-red': {
          DEFAULT: '#FF0040',
          dark: '#CC0033',
        },
        'dark-bg': {
          DEFAULT: '#0A0A0B',
          light: '#1A1A1C',
        },
        'card-glass': 'rgba(20, 20, 22, 0.8)',
      },
      backgroundImage: {
        'gradient-neon-green': 'linear-gradient(135deg, #00FF41 0%, #00C832 100%)',
        'gradient-cyber-blue': 'linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)',
        'gradient-danger-red': 'linear-gradient(135deg, #FF0040 0%, #CC0033 100%)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'scan-line': 'scan-line 3s linear infinite',
        'glitch': 'glitch 0.3s ease-in-out infinite',
        'matrix-rain': 'matrix-rain 8s linear infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 10px #00FF41, 0 0 20px #00FF41, 0 0 30px #00FF41',
          },
          '50%': {
            opacity: '0.8',
            boxShadow: '0 0 5px #00FF41, 0 0 10px #00FF41, 0 0 15px #00FF41',
          },
        },
        'scan-line': {
          '0%': {
            transform: 'translateY(-100%)',
            opacity: '0.8',
          },
          '50%': {
            opacity: '1',
          },
          '100%': {
            transform: 'translateY(100vh)',
            opacity: '0.8',
          },
        },
        'glitch': {
          '0%, 100%': {
            transform: 'translate(0)',
            filter: 'hue-rotate(0deg)',
          },
          '20%': {
            transform: 'translate(-2px, 2px)',
            filter: 'hue-rotate(90deg)',
          },
          '40%': {
            transform: 'translate(-2px, -2px)',
            filter: 'hue-rotate(180deg)',
          },
          '60%': {
            transform: 'translate(2px, 2px)',
            filter: 'hue-rotate(270deg)',
          },
          '80%': {
            transform: 'translate(2px, -2px)',
            filter: 'hue-rotate(360deg)',
          },
        },
        'matrix-rain': {
          '0%': {
            transform: 'translateY(-100%)',
            opacity: '0',
          },
          '10%': {
            opacity: '1',
          },
          '90%': {
            opacity: '1',
          },
          '100%': {
            transform: 'translateY(100vh)',
            opacity: '0',
          },
        },
      },
      backdropBlur: {
        'glass': '12px',
        'card': '16px',
        'strong': '24px',
      },
    },
  },
  plugins: [],
};

export default config;

