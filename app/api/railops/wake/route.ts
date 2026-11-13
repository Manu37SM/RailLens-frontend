import { after, NextRequest, NextResponse } from 'next/server';
import { isSameOrigin } from '@/lib/server/authProxy';
import { wakeRailOps, wakeTargets } from '@/lib/server/railopsWake';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * POST /api/railops/wake: called by the sign-in and booking pages (RailOpsWaker). Answers at once; the pings to
 * RailOps run after the response (see lib/server/railopsWake.ts). Only this site's own pages may call it.
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return new NextResponse(null, { status: 403 });
  }
  if (wakeTargets().length === 0) {
    return new NextResponse(null, { status: 204 });
  }
  after(async () => {
    await wakeRailOps();
  });
  return new NextResponse(null, { status: 202 });
}
