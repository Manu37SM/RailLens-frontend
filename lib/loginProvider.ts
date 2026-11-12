/**
 * Who handles sign-in (single login, Phase 4D). Read at build time, so changing it needs a redeploy.
 *
 * - 'raillens' (default): RailLens' own accounts, exactly as before.
 * - 'railops': the RailOps login, shared with the RailOps app. Sign-in is by email; new accounts give a phone
 *   number; staff admins enter their one-time code. Rolling back = set it to 'raillens' and redeploy.
 *
 * Any other value means 'raillens', so a typo can never switch providers by accident.
 */
export type LoginProvider = 'raillens' | 'railops';

export function loginProvider(): LoginProvider {
  return process.env.NEXT_PUBLIC_RAILLENS_LOGIN_PROVIDER?.trim() === 'railops'
    ? 'railops'
    : 'raillens';
}
