import { describe, expect, it } from 'vitest';
import { contentSecurityPolicy } from './csp';

const directive = (csp: string, name: string) =>
  csp.split('; ').find((d) => d.startsWith(name + ' ')) ?? '';

describe('Content-Security-Policy (Phase 6)', () => {
  const prod = contentSecurityPolicy({
    apiBaseUrl: 'https://raillens-train-db.onrender.com/api/v1',
    railOpsApiUrl: 'https://railops-gateway.onrender.com/',
    production: true,
  });

  it('lets the browser talk only to this site, the RailLens API and the RailOps gateway', () => {
    expect(directive(prod, 'connect-src')).toBe(
      "connect-src 'self' https://raillens-train-db.onrender.com https://railops-gateway.onrender.com"
    );
  });

  it('blocks framing, plugins, base hijacking, foreign forms; no eval in production', () => {
    expect(prod).toContain("frame-ancestors 'none'");
    expect(prod).toContain("object-src 'none'");
    expect(prod).toContain("base-uri 'self'");
    expect(prod).toContain("form-action 'self'");
    expect(directive(prod, 'script-src')).not.toContain('unsafe-eval');
    expect(prod).toContain('upgrade-insecure-requests');
  });

  it('booking off: no RailOps origin; bad URLs are dropped rather than widening the policy', () => {
    const off = contentSecurityPolicy({
      apiBaseUrl: 'javascript:alert(1)',
      production: true,
    });
    expect(directive(off, 'connect-src')).toBe("connect-src 'self'");
  });

  it('development allows eval (React overlays) and plain http to the local API', () => {
    const dev = contentSecurityPolicy({
      apiBaseUrl: 'http://localhost:8080/api/v1',
      production: false,
    });
    expect(directive(dev, 'script-src')).toContain("'unsafe-eval'");
    expect(directive(dev, 'connect-src')).toContain('http://localhost:8080');
    expect(dev).not.toContain('upgrade-insecure-requests');
  });
});
