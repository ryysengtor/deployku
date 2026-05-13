import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /api/admin/* routes (except auth and test-notif)
  const isAdminApi = pathname.startsWith('/api/admin/');
  const isAuthRoute = pathname === '/api/admin/auth';
  const isTestNotifRoute = pathname === '/api/admin/test-notif';

  if (isAdminApi && !isAuthRoute && !isTestNotifRoute) {
    // Check for admin token cookie
    const adminToken = request.cookies.get('admin_token')?.value;

    if (!adminToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/admin/:path*'],
};
