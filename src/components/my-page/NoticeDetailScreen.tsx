'use client';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { findNotice } from '@/content/notices';
import { formatDateShort } from '@/lib/date';
import { MyPageBackLink } from './MyPageBackLink';

interface NoticeDetailScreenProps {
  slug: string;
}

/** My Page → Notices → one notice (Figma 260:32916). */
export function NoticeDetailScreen({ slug }: NoticeDetailScreenProps) {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);
  const notice = findNotice(locale, slug);

  return (
    <div className="flex min-h-dvh flex-col bg-brand-white">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-[calc(3.5rem+env(safe-area-inset-top,0px))] items-center bg-brand-white px-4 pt-[env(safe-area-inset-top,0px)]">
          <MyPageBackLink ariaLabel={t.myPage.backAriaLabel} href="/settings/notices" />
        </header>
        {notice ? (
          <article className="mt-2 flex flex-col">
            <div className="flex flex-col gap-3.5 break-words border-b border-brand-gray200 px-5 py-3.5">
              <h1 className="text-xl font-medium leading-none text-brand-gray900">
                {notice.title}
              </h1>
              <time dateTime={notice.date} className="text-sm leading-[1.5] text-brand-gray500">
                {formatDateShort(notice.date, locale)}
              </time>
            </div>
            <ul className="flex list-disc flex-col gap-1 py-4 pl-10 pr-5 marker:text-brand-gray500">
              {notice.items.map((item) => (
                <li key={item} className="break-words text-sm leading-[1.5] text-brand-gray800">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ) : null}
      </div>
    </div>
  );
}
