import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'sans-serif',
        ],
      },
      colors: {
        auth: {
          bg: '#FDE2EF',
          button: '#353434',
          buttonText: '#FFFDFE',
          logoMuted: '#B9B7B8',
          linkMuted: '#585657',
        },
        calendar: {
          menstrualBg: '#FBD0DE',
          menstrualFg: '#7A2942',
          predictedRing: '#D9B3C4',
          conditionDot: '#B59FCB',
        },
        brand: {
          pink50: '#FDE2EF',
          pink100: '#FBB7D8',
          pink200: '#F689BC',
          pink900: '#87005A',
          gray300: '#F0EEEF',
          gray400: '#D5D3D4',
          gray600: '#8E8C8D',
          gray900: '#353434',
          white: '#FFFDFE',
        },
        nav: {
          pillBg: 'rgba(255,253,254,0.8)',
          pillBorder: '#FFFDFE',
          activePillBg: 'rgba(251,183,216,0.3)',
          activePillBorder: '#FDE2EF',
        },
      },
    },
  },
  plugins: [],
};

export default config;
