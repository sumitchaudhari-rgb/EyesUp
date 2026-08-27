/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF6EE',
          200: '#F4ECE1',
          300: '#EBE0D0',
          400: '#DFCFBA',
          500: '#CBB79F',
          600: '#A99379',
          900: '#3D3428'
        },
        indigo: {
          pen: '#1E293B',
          deep: '#0F172A',
          night: '#1E3A5F',
          wash: '#334155',
          muted: '#64748B',
          light: '#E2E8F0',
        },
        highlighter: {
          glow: '#FEF08A',
          DEFAULT: '#FDE047',
          hover: '#FACC15',
          active: '#FEF9C3',
          border: '#EAB308',
        },
        margin: {
          red: '#E11D48',
          subtle: '#FDA4AF',
        },
        ruled: {
          line: '#E2D9C8',
          grid: '#EFE8DC',
        }
      },
      fontFamily: {
        serif: ['"Fraunces"', '"Lora"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        handwriting: ['"Caveat"', 'cursive'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'notebook': '0 4px 20px -2px rgba(61, 52, 40, 0.08), 0 2px 6px -1px rgba(61, 52, 40, 0.04)',
        'page': '0 10px 30px -5px rgba(30, 41, 59, 0.08), 0 0 0 1px rgba(226, 217, 200, 0.6)',
        'float-bar': '0 12px 36px -4px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(30, 41, 59, 0.08)',
        'highlight': '0 0 0 3px rgba(253, 224, 71, 0.45)',
      },
      backgroundImage: {
        'ruled-pattern': 'repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(226, 217, 200, 0.45) 31px, rgba(226, 217, 200, 0.45) 32px)',
        'grid-pattern': 'radial-gradient(circle, rgba(169, 147, 121, 0.2) 1px, transparent 1px)',
      }
    },
  },
  plugins: [],
}
