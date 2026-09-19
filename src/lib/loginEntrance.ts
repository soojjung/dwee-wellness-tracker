// One-shot signal from the onboarding slides to the login screen: "you were
// just reached from the intro, play the sticker entrance". Same shape as
// `appToast` — module-scoped so it survives the client-side navigation but not
// a reload, and consuming it clears it. Every other way into /login (sign-out,
// MyPage → sign in, relaunch) finds nothing queued and renders at rest.

let pending = false;

export function queueLoginEntrance(): void {
  pending = true;
}

export function consumeLoginEntrance(): boolean {
  const queued = pending;
  pending = false;
  return queued;
}
