/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Orbitron', 'Rajdhani', 'system-ui', 'sans-serif'],
        body: ['Inter', 'Rajdhani', 'system-ui', 'sans-serif']
      },
      colors: {
        void: '#050711',
        panel: '#0b1020',
        cyan: '#00f5ff',
        fuchsia: '#ff2bd6',
        limepulse: '#9cff2e',
        solar: '#ffbd3d'
      },
      boxShadow: {
        neon: '0 0 28px rgba(0, 245, 255, 0.35)',
        magenta: '0 0 28px rgba(255, 43, 214, 0.28)'
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        }
      },
      animation: {
        scan: 'scan 6s linear infinite'
      }
    }
  },
  plugins: []
};
