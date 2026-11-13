/**
 * Content-Security-Policy for every page (Phase 6), built once at build time from the public API addresses.
 *
 * What it guarantees: scripts, styles, fonts and workers only from this site; the browser only talks to this site,
 * the RailLens API and (when booking is on) the RailOps gateway, so injected code can't send data elsewhere; no
 * plugins, no <base> hijacking, forms only post here, and no other site can frame these pages.
 *
 * What it does NOT do: block inline scripts. Next.js puts its page data in inline scripts, and most pages here are
 * static (built once, served from the CDN), so there is no per-request nonce to allow them by. A nonce-based policy
 * would force every page to render per request (slower, and more Vercel usage); that's the next step if wanted.
 */
export interface CspInput {
  apiBaseUrl?: string;
  railOpsApiUrl?: string;
  production: boolean;
}

function origin(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.origin : null;
  } catch {
    return null;
  }
}

export function contentSecurityPolicy({
  apiBaseUrl,
  railOpsApiUrl,
  production,
}: CspInput): string {
  const connect = ["'self'", origin(apiBaseUrl), origin(railOpsApiUrl)].filter(
    (v, i, all): v is string => v !== null && all.indexOf(v) === i
  );
  const directives = [
    "default-src 'self'",
    // 'unsafe-eval' only in development: React uses eval there for error overlays.
    `script-src 'self' 'unsafe-inline'${production ? '' : " 'unsafe-eval'"}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src ${connect.join(' ')}`,
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
  if (production) directives.push('upgrade-insecure-requests');
  return directives.join('; ');
}
