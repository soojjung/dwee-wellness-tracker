import * as Sentry from '@sentry/capacitor';
import * as SentryReact from '@sentry/react';
import { Capacitor } from '@capacitor/core';

/**
 * Crash / error reporting (release STEP 1.7). One SDK pair for both targets:
 * `@sentry/capacitor` adds the iOS native layer, `@sentry/react` is its web
 * sibling — the app is a static export, so nothing from `@sentry/nextjs`
 * would run anyway. Errors only: no tracing, replay or logs.
 *
 * Privacy: `sendDefaultPii` stays off and `scrubEvent` strips anything that
 * could identify a person or leak a record before the event leaves the
 * device — emails, OAuth tokens in callback URLs, and free-text messages
 * that might carry diary content.
 */

// `@sentry/core` types aren't a direct dependency — derive them from the init options.
type BeforeSend = NonNullable<SentryReact.BrowserOptions['beforeSend']>;
type ErrorEvent = Parameters<BeforeSend>[0];
type Breadcrumb = NonNullable<ErrorEvent['breadcrumbs']>[number];

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const RELEASE = process.env.NEXT_PUBLIC_APP_VERSION
  ? `dwee@${process.env.NEXT_PUBLIC_APP_VERSION}`
  : undefined;

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const TOKEN_PARAM_RE = /([?#&](?:access_token|refresh_token|code|token|id_token)=)[^&#]+/gi;

function scrubText(text: string): string {
  return text.replace(TOKEN_PARAM_RE, '$1[filtered]').replace(EMAIL_RE, '[email]');
}

function scrubUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  // Query and hash can carry Supabase session tokens (OAuth return) — keep the path only.
  return url.split(/[?#]/)[0];
}

export function scrubEvent(event: ErrorEvent): ErrorEvent {
  // We never attach a user; drop anything an integration might have added.
  delete event.user;

  if (event.request) {
    event.request.url = scrubUrl(event.request.url);
    delete event.request.cookies;
    delete event.request.headers;
    delete event.request.query_string;
  }

  if (event.message) event.message = scrubText(event.message);
  for (const ex of event.exception?.values ?? []) {
    if (ex.value) ex.value = scrubText(ex.value);
  }

  event.breadcrumbs = event.breadcrumbs
    ?.filter((b: Breadcrumb) => b.category !== 'console')
    .map((b: Breadcrumb) => {
      if (b.message) b.message = scrubText(b.message);
      if (b.data) {
        for (const key of ['url', 'from', 'to']) {
          if (typeof b.data[key] === 'string') b.data[key] = scrubUrl(b.data[key] as string);
        }
      }
      return b;
    });

  return event;
}

let initialized = false;

export function initSentry(): void {
  if (initialized || typeof window === 'undefined' || !DSN) return;
  initialized = true;

  Sentry.init(
    {
      dsn: DSN,
      release: RELEASE,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      // Local dev sends nothing; set NEXT_PUBLIC_SENTRY_DEBUG=1 to test the pipeline.
      enabled:
        process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_SENTRY_DEBUG === '1',
      sendDefaultPii: false,
      tracesSampleRate: 0,
      beforeSend: scrubEvent,
      ignoreErrors: [
        // User cancelled a picker / camera prompt — not a defect.
        'AbortError',
        'NotAllowedError',
        // Browser extensions and stale chunks after a deploy.
        /extension:\/\//,
        'ChunkLoadError',
      ],
      initialScope: {
        tags: { platform: Capacitor.isNativePlatform() ? Capacitor.getPlatform() : 'web' },
      },
    },
    SentryReact.init,
  );
}

export const captureException = SentryReact.captureException;
