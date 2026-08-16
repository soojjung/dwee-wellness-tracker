// Tiny cross-route toast queue. Any screen can queue a message (typically
// right before triggering a navigation); the next mounted screen that calls
// `consumeAppToast()` picks it up and clears the queue. Used today for the
// post-logout confirmation toast — the sign-out flow queues a message then
// navigates home, and the destination screen shows it via the shared Toast
// component.
//
// Intentionally module-scoped (not in a store) so we don't need to wire
// subscribers or React context — the queue survives client-side navigation
// but is cleared on hard reload, which is exactly what we want.

let pending: string | null = null;

export function queueAppToast(message: string): void {
  pending = message;
}

export function consumeAppToast(): string | null {
  const msg = pending;
  pending = null;
  return msg;
}
