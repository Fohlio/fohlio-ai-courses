/**
 * Validate a redirect target before navigating to it.
 *
 * Accepts only same-origin, single-leading-slash paths. Rejects:
 *   - empty / null / undefined
 *   - protocol-relative URLs (`//evil.com`)
 *   - absolute URLs (`http://…`, `javascript:…`)
 *   - auth pages (`/login`, `/register`) — would loop after login
 *
 * Anything else falls back to `/courses` (or the provided fallback).
 */
export function safeRedirectTarget(
  raw: string | null | undefined,
  fallback = "/courses",
): string {
  if (!raw || typeof raw !== "string") return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//")) return fallback;
  if (raw.startsWith("/login") || raw.startsWith("/register")) return fallback;
  return raw;
}
