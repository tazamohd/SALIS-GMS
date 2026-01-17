/** tailwind.config.js — KSA Vision Dark Neon */
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: { primary: '#0B0F0D', secondary: '#0E1411' },
        surface: { 1: '#141A17', 2: '#1C2420', 3: '#24302A' },
        brand: { 500: '#22C55E', 600: '#16A34A' },
        accent: { 500: '#EAB308', 600: '#CA8A04' },
        text: { primary: '#E5E7EB', secondary: '#9CA3AF', muted: '#6B7280', disabled: '#4B5563' },
        semantic: { success: '#22C55E', warning: '#F59E0B', error: '#EF4444', info: '#06B6D4' }
      },
      boxShadow: {
        glow: '0 0 24px rgba(34,197,94,0.25)',
        glowGold: '0 0 24px rgba(234,179,8,0.25)',
        soft: '0 8px 24px rgba(0,0,0,0.45)'
      }
    }
  }
};
