import connectDB from '@/lib/mongodb';
import Settings from '@/lib/models/Settings';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return Response.json(
        { success: false, error: 'Missing required field: password' },
        { status: 400 }
      );
    }

    let authenticated = false;

    try {
      await connectDB();

      const adminPasswordSetting = await Settings.findOne({ key: 'admin_password' });

      if (!adminPasswordSetting) {
        // Default password
        if (password === 'admin123') {
          authenticated = true;
        }
      } else {
        const storedPassword = adminPasswordSetting.value;
        if (password === storedPassword) {
          authenticated = true;
        }
      }
    } catch (dbError) {
      // MongoDB not available, use default password
      if (password === 'admin123') {
        authenticated = true;
      }
    }

    if (authenticated) {
      // Set admin token cookie
      const token = Buffer.from(`admin:${Date.now()}`).toString('base64');
      const cookieStore = await cookies();
      cookieStore.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      return Response.json({
        success: true,
        data: { authenticated: true },
      });
    }

    return Response.json(
      { success: false, error: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error authenticating admin:', error);
    return Response.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin_token');

    return Response.json({
      success: true,
      data: { loggedOut: true },
    });
  } catch (error) {
    console.error('Error logging out admin:', error);
    return Response.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}
