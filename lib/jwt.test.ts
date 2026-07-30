import { describe, expect, it } from 'vitest';

import { getJwtExpiryMillis } from './jwt';

function makeToken(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  // Signature is never checked client-side (see jwt.ts's own doc comment),
  // so any placeholder works for these tests.
  return `${header}.${body}.signature`;
}

describe('getJwtExpiryMillis', () => {
  it('reads the exp claim and converts seconds to milliseconds', () => {
    const expSeconds = 1_800_000_000;
    const token = makeToken({ exp: expSeconds, sub: 'user' });

    expect(getJwtExpiryMillis(token)).toBe(expSeconds * 1000);
  });

  it('returns null when the exp claim is missing', () => {
    const token = makeToken({ sub: 'user' });
    expect(getJwtExpiryMillis(token)).toBeNull();
  });

  it('returns null for a malformed token', () => {
    expect(getJwtExpiryMillis('not-a-jwt')).toBeNull();
    expect(getJwtExpiryMillis('')).toBeNull();
  });

  it('returns null for a payload segment that is not valid base64 JSON', () => {
    expect(getJwtExpiryMillis('header.%%%invalid%%%.signature')).toBeNull();
  });

  it('handles URL-safe base64 characters (- and _) in the payload', () => {
    // Craft a payload whose base64 happens to contain - / _ substitutions
    // by using a value likely to produce +/ in standard base64.
    const token = makeToken({ exp: 1700000000, note: '???>>>various+data/here' });
    const urlSafeToken = token.replace(/\+/g, '-').replace(/\//g, '_');

    expect(getJwtExpiryMillis(urlSafeToken)).toBe(1700000000 * 1000);
  });
});
