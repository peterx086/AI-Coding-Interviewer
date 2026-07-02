module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#0f172a',
        panel: '#111827',
        border: '#1f2937',
      },
      boxShadow: {
        panel: '0 10px 30px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [],
};
