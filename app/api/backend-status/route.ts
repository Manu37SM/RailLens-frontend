import { NextRequest, NextResponse } from 'next/server';
import { isSameOrigin } from '@/lib/server/authProxy';
import { BackendService, probeService } from '@/lib/server/backendProbe';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * POST /api/backend-status?service=raillens|railops: is that backend up, waking up, or down?
 * Polled by the backend-status banner while a backend is unreachable (see lib/backendStatus). Only this site's own
 * pages may call it, so it can't be used to make the server ping anything. The ping also wakes a sleeping service.
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return new NextResponse(null, { status: 403 });
  }
  const service = request.nextUrl.searchParams.get('service');
  if (service !== 'raillens' && service !== 'railops') {
    return NextResponse.json({ error: 'Unknown service' }, { status: 400 });
  }
  const state = await probeService(service as BackendService);
  return NextResponse.json(
    { service, state: state ?? 'unconfigured' },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
