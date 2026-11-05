/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          cyan: '#0cb1d6',
          blue: '#328fe1',
          indigo: '#6266f0',
          violet: '#865df4',
          purple: '#a356f6',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(90deg, #0cb1d6 0%, #328fe1 25%, #6266f0 50%, #865df4 75%, #a356f6 100%)',
        'brand-gradient-hover': 'linear-gradient(90deg, #18c1e7 0%, #439de8 25%, #7276f5 50%, #946ef7 75%, #b168f8 100%)',
      },
    },
  },
  plugins: [],
};
