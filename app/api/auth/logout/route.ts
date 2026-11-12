import { NextRequest } from 'next/server';
import { proxyAuth } from '@/lib/server/authProxy';
export const maxDuration = 60;
export async function POST(request: NextRequest) {
  return proxyAuth(request, '/auth/logout', 'logout');
}
