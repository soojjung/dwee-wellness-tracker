'use client';
import Link from 'next/link';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { noticeSlug, noticesFor, type Notice } from '@/content/notices';
import { formatDateShort } from '@/lib/date';
import type { Locale } from '@/types';
import { MyPageBackLink } from './MyPageBackLink';

/** My Page → Notices list (Figma 257:1961): one card per app version, newest first. */
export function NoticesScreen() {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);
  const notices = noticesFor(locale);

  return (
    <div className="flex min-h-dvh flex-col bg-brand-gray200">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        {/* 시안엔 헤더 제목이 없다 — 스크린리더용으로만 둔다. */}
        <header className="sticky top-0 z-10 flex h-[calc(3.5rem+env(safe-area-inset-top,0px))] items-center bg-brand-gray200 px-4 pt-[env(safe-area-inset-top,0px)]">
          <MyPageBackLink ariaLabel={t.myPage.backAriaLabel} />
          <h1 className="sr-only">{t.myPage.support.notices}</h1>
        </header>
        {notices.length === 0 ? (
          <main className="flex flex-1 items-center justify-center px-8">
            <p className="text-center text-sm leading-[1.5] text-brand-gray700">
              {t.myPage.notices.empty}
            </p>
          </main>
        ) : (
          <main className="flex flex-col gap-2 px-4 pb-10 pt-2">
            {notices.map((notice) => (
              <NoticeRow key={notice.version} notice={notice} locale={locale} />
            ))}
          </main>
        )}
      </div>
    </div>
  );
}

function NoticeRow({ notice, locale }: { notice: Notice; locale: Locale }) {
  return (
    <Link
      href={`/settings/notices/${noticeSlug(notice.version)}`}
      className="flex items-center gap-0.5 rounded-2xl bg-brand-white px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
    >
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 break-words">
        <span className="text-base font-semibold leading-none text-brand-gray900">
          {notice.title}
        </span>
        <time dateTime={notice.date} className="text-xs leading-[1.5] text-brand-gray500">
          {formatDateShort(notice.date, locale)}
        </time>
      </span>
      {/* 시안 에셋 icon_back_L(위쪽 꺾쇠)을 시안처럼 90° 돌려 오른쪽 화살표로 쓴다. */}
      <img
        src="/icons/ui/icon-back-l.svg"
        alt=""
        width={18}
        height={18}
        className="size-[18px] shrink-0 rotate-90"
      />
    </Link>
  );
}
