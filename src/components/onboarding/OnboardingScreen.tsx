'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useIntroStore } from '@/store/introStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useBootDelay } from '@/hooks/useBootDelay';
import { queueLoginEntrance } from '@/lib/loginEntrance';
import { SplashScreen } from '@/components/app/SplashScreen';
import { OnboardingSlides } from './OnboardingSlides';

// 첫 실행은 "로고 → 온보딩 1" 순서가 눈에 보여야 한다. 로딩이 빨리 끝나도 로고가
// 번쩍하고 사라지지 않게 잡아 두는 최소 시간 (정의서 000: 3s 이내).
const MIN_SPLASH_MS = 2000;

export function OnboardingScreen() {
  const router = useRouter();
  const splashHeld = !useBootDelay(MIN_SPLASH_MS);
  const [leaving, setLeaving] = useState(false);

  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const authHydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const hydrateIntro = useIntroStore((s) => s.hydrate);
  const introHydrated = useIntroStore((s) => s.hydrated);
  const introSeen = useIntroStore((s) => s.seen);
  const markIntroSeen = useIntroStore((s) => s.markSeen);
  // (intro) 그룹은 AppShell 밖이라 설정도 여기서 직접 hydrate — 그래야 첫 화면부터
  // 기기 언어로 보인다.
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const settingsHydrated = useSettingsStore((s) => s.hydrated);
  const settingsFailed = useSettingsStore((s) => s.error !== null);

  useEffect(() => {
    if (!authHydrated) hydrateAuth();
    if (!introHydrated) hydrateIntro();
    if (!settingsHydrated && !settingsFailed) hydrateSettings();
  }, [
    authHydrated,
    hydrateAuth,
    introHydrated,
    hydrateIntro,
    settingsHydrated,
    settingsFailed,
    hydrateSettings,
  ]);

  // 마지막 "다음"·건너뛰기 직후 바로 넘어가도록 로그인 화면을 미리 받아 둔다.
  useEffect(() => {
    router.prefetch('/login');
  }, [router]);

  // 끝내기·건너뛰기는 markSeen 만 부르고, 이동은 여기 한 곳에서 한다.
  useEffect(() => {
    if (!authHydrated || !introHydrated) return;
    if (user) router.replace('/');
    else if (introSeen) router.replace('/login');
  }, [authHydrated, introHydrated, user, introSeen, router]);

  // 설정을 못 읽어도 기본 언어로 보여 주면 된다 — 스플래시에 가둘 이유는 아니다.
  const settingsSettled = settingsHydrated || settingsFailed;
  const ready = authHydrated && introHydrated && settingsSettled && !user && !introSeen;
  // 나가는 중에는 introSeen 이 이미 true 다. 그때 스플래시로 돌아가면 로그인 화면 앞에
  // 로고가 한 번 더 번쩍이므로, 화면이 바뀔 때까지 슬라이드를 그대로 둔다.
  if (!leaving && (!ready || splashHeld)) return <SplashScreen />;

  const handleFinish = () => {
    setLeaving(true);
    queueLoginEntrance();
    void markIntroSeen();
  };
  return <OnboardingSlides onFinish={handleFinish} />;
}
