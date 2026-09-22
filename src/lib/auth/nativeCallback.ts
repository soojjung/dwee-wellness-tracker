/**
 * Native (Capacitor) OAuth return path. The system browser finishes the
 * provider flow and Supabase redirects to this custom scheme; iOS hands the
 * URL to the app, which forwards it to the same `/auth/callback` page the web
 * build uses so supabase-js can pick the session out of the query/hash as
 * usual. Pure helpers — the listener wiring lives in authStore.
 */
export const NATIVE_AUTH_REDIRECT = 'dwee://auth/callback';
export const WEB_AUTH_CALLBACK_PATH = '/auth/callback/';

export function isNativeAuthCallback(url: string): boolean {
  return (
    url === NATIVE_AUTH_REDIRECT ||
    url.startsWith(`${NATIVE_AUTH_REDIRECT}?`) ||
    url.startsWith(`${NATIVE_AUTH_REDIRECT}#`) ||
    url.startsWith(`${NATIVE_AUTH_REDIRECT}/`)
  );
}

/**
 * `dwee://auth/callback?code=abc#x=y` → `/auth/callback/?code=abc#x=y`.
 * Keeps query and hash verbatim: PKCE returns `?code=`, the implicit flow
 * returns `#access_token=…`, and supabase-js reads either from the page URL.
 * Returns null for URLs that are not the auth callback.
 */
export function toWebCallbackPath(url: string): string | null {
  if (!isNativeAuthCallback(url)) return null;
  const rest = url.slice(NATIVE_AUTH_REDIRECT.length).replace(/^\/+/, '');
  const q = rest.indexOf('?');
  const h = rest.indexOf('#');
  const cut = [q, h].filter((i) => i >= 0);
  const suffix = cut.length ? rest.slice(Math.min(...cut)) : '';
  return WEB_AUTH_CALLBACK_PATH + suffix;
}
