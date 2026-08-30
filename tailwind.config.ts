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
          pink300: '#F158A0',
          pink400: '#EE2E89',
          pink500: '#EC0072',
          pink600: '#DA006E',
          pink700: '#C30068',
          pink800: '#AE0063',
          pink900: '#87005A',
          gray50: '#FFFDFE',
          gray100: '#FAF8F9',
          gray200: '#F5F3F4',
          gray300: '#F0EEEF',
          gray400: '#D5D3D4',
          gray500: '#B9B7B8',
          gray600: '#8E8C8D',
          gray700: '#787777',
          gray800: '#585657',
          gray900: '#353434',
          white: '#FFFDFE',
          lavender100: '#D1C5EE',
          lavender400: '#7D5ACF',
        },
        nav: {
          pillBg: 'rgba(255,253,254,0.8)',
          pillBorder: '#FFFDFE',
          activePillBg: 'rgba(251,183,216,0.3)',
          activePillBorder: '#FDE2EF',
        },
      },
      keyframes: {
        // Top confirm toast (015_8): slides in from just above the viewport
        // and settles at its resting top offset. Paired with a subtle
        // fade for a softer feel.
        slideDownFade: {
          '0%': { transform: 'translateY(-120%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        // Diary sticker "scanning" animation (013_3): a soft pink bar
        // sweeps top→bottom over the captured photo to signal "processing".
        stickerScan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        // Diary onboarding nudge (spec 8): the calendar pulls slightly to
        // the left and returns, hinting that horizontal swipe changes the
        // month. Runs once per app session when the tab is opened.
        diaryNudge: {
          '0%': { transform: 'translateX(0)' },
          '35%': { transform: 'translateX(-14px)' },
          '65%': { transform: 'translateX(-14px)' },
          '100%': { transform: 'translateX(0)' },
        },
        // Diary "focus today" pulse — soft ring ripples out from today's
        // number pill when the log tab is tapped. Fades to fully transparent
        // so it doesn't leave a visual artifact.
        diaryTodayRing: {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '30%': { transform: 'scale(1.05)', opacity: '0.55' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        // "오늘" callout bubble above today's cell. Slides in from just
        // above and fades in, holds, then fades out.
        diaryTodayBubble: {
          '0%': { transform: 'translate(-50%, -4px)', opacity: '0' },
          '15%': { transform: 'translate(-50%, 0)', opacity: '1' },
          '80%': { transform: 'translate(-50%, 0)', opacity: '1' },
          '100%': { transform: 'translate(-50%, -4px)', opacity: '0' },
        },
      },
      animation: {
        slideDownFade: 'slideDownFade 280ms cubic-bezier(0.16, 1, 0.3, 1)',
        stickerScan: 'stickerScan 1.4s ease-in-out',
        diaryNudge: 'diaryNudge 900ms ease-in-out',
        diaryTodayRing: 'diaryTodayRing 1500ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        diaryTodayBubble: 'diaryTodayBubble 1600ms ease-in-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
