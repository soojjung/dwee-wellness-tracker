import { MyPageToggle } from './MyPageToggle';

/** 설정 하위 화면에서 쓰는 흰 카드. */
export function SettingCard({ children }: { children: React.ReactNode }) {
  return <section className="overflow-hidden rounded-2xl bg-brand-white">{children}</section>;
}

interface SettingToggleRowProps {
  title: string;
  enabled: boolean;
  onToggle: () => void;
}

/** 제목 + 토글 한 줄 (Figma 292:2765 상단 행). */
export function SettingToggleRow({ title, enabled, onToggle }: SettingToggleRowProps) {
  return (
    <div className="flex h-[52px] items-center justify-between px-5">
      <span className="text-base font-medium text-brand-gray900">{title}</span>
      <MyPageToggle enabled={enabled} onToggle={onToggle} ariaLabel={title} />
    </div>
  );
}

interface SettingDetailRowProps {
  title: string;
  subtitle: string;
  enabled: boolean;
  onToggle: () => void;
}

/** 제목 + 설명 + 토글 (Figma 292:2765 세부 행). */
export function SettingDetailRow({ title, subtitle, enabled, onToggle }: SettingDetailRowProps) {
  return (
    <div className="flex min-h-[72px] items-center justify-between gap-3 px-5 py-3.5">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-base font-medium leading-tight text-brand-gray900">{title}</span>
        <span className="text-xs leading-tight text-brand-gray600">{subtitle}</span>
      </div>
      <MyPageToggle enabled={enabled} onToggle={onToggle} ariaLabel={title} />
    </div>
  );
}
