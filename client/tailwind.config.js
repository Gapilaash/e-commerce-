/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#0A1420',
        surface: '#101C2E',
        ink: '#F3F6FA',
        muted: '#8CA0B8',
        line: '#22314A',
        forest: {
          DEFAULT: '#3FA9E0',
          dark: '#2C86B8',
          light: '#16293D'
        },
        gold: {
          DEFAULT: '#D7A354',
          light: '#241D0E'
        }
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif']
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        lg: '10px'
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(ellipse at 50% 0%, #1C3A57 0%, #0A1420 60%)'
      }
    }
  },
  plugins: []
};
