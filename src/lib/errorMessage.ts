// reason: narrowing `unknown` to `Error` here is the deliberate contract of
// this helper — callers pass whatever a `catch` block hands them.
export const errorMessage = (e: unknown): string => (e as Error).message;
