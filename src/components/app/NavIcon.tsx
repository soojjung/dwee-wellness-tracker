export type NavIconKey = 'home' | 'log' | 'insights' | 'settings';

interface NavIconProps {
  icon: NavIconKey;
  className?: string;
}

export function NavIcon({ icon, className }: NavIconProps) {
  switch (icon) {
    case 'home':
      return (
        <svg viewBox="0 0 24 23" fill="currentColor" className={className} aria-hidden>
          <path d="M1.56116 6.98335L9.56116 0.829504C10.999 -0.276501 13.001 -0.276501 14.4388 0.829504L22.4388 6.98335C23.4232 7.74054 24 8.91197 24 10.1538V18.9535C24 21.1626 22.2091 22.9535 20 22.9535H4C1.79086 22.9535 0 21.1626 0 18.9535V10.1538C0 8.91197 0.576816 7.74054 1.56116 6.98335Z" />
        </svg>
      );
    case 'log':
      return (
        <svg viewBox="0 0 24 22" fill="currentColor" className={className} aria-hidden>
          <path d="M24 18C24 20.2091 22.2091 22 20 22H4C1.79086 22 0 20.2091 0 18V11.5C0 10.9477 0.447715 10.5 1 10.5H23C23.5523 10.5 24 10.9477 24 11.5V18Z" />
          <path d="M18 0C19.1046 0 20 0.895431 20 2V4C22.2091 4 24 5.79086 24 8C24 8.55228 23.5523 9 23 9H1C0.447716 9 0 8.55228 0 8C0 5.79086 1.79086 4 4 4V2C4 0.895431 4.89543 0 6 0C7.10457 0 8 0.895431 8 2V4H16V2C16 0.895431 16.8954 0 18 0Z" />
        </svg>
      );
    case 'insights':
      return (
        <svg viewBox="0 0 24 20" fill="currentColor" className={className} aria-hidden>
          <path d="M1.31669 0.397252C4.30042 -0.319783 8.13937 -0.0661386 10.8334 1.15819C11.5685 1.49224 12.4315 1.49224 13.1666 1.15819C15.8606 -0.0661386 19.6996 -0.319783 22.6833 0.397252C23.4902 0.591163 24 1.34843 24 2.17831V15.8979C24 17.2987 22.5742 18.3018 21.1844 18.1265C18.4934 17.787 15.427 18.1309 13.1666 19.1582C12.4315 19.4922 11.5685 19.4922 10.8334 19.1582C8.57301 18.1309 5.5066 17.787 2.81561 18.1265C1.42578 18.3018 0 17.2987 0 15.8979V2.17831C0 1.34843 0.50978 0.591163 1.31669 0.397252Z" />
        </svg>
      );
    case 'settings':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
          <circle cx="12" cy="7" r="6" />
          <path d="M2.32 21.18C3.88 18.38 7.2 16 12.28 16C17.36 16 20.68 18.38 22.24 21.18C23.31 23.11 21.49 25 19.28 25H5.28C3.07 25 1.24 23.11 2.32 21.18Z" />
        </svg>
      );
  }
}
