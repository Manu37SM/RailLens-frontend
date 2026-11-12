import { NextRequest } from 'next/server';
import { proxyAuth } from '@/lib/server/authProxy';
import { railOpsAuth } from '@/lib/server/railopsAuth';
import { loginProvider } from '@/lib/loginProvider';
export const maxDuration = 60;
export async function POST(request: NextRequest) {
  return loginProvider() === 'railops'
    ? railOpsAuth(request, 'logout')
    : proxyAuth(request, '/auth/logout', 'logout');
}
