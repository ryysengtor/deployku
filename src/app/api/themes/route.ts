import connectDB from '@/lib/mongodb';
import Theme from '@/lib/models/Theme';
import { DEMO_THEMES } from '@/lib/demo-data';

export async function GET() {
  try {
    await connectDB();

    const themes = await Theme.find({});
    const activeTheme = themes.find((t) => t.isActive);

    return Response.json({
      success: true,
      data: {
        themes,
        activeTheme: activeTheme || null,
      },
    });
  } catch (error) {
    console.error('Error fetching themes, using demo data:', error);
    return Response.json({
      success: true,
      data: {
        themes: DEMO_THEMES,
        activeTheme: DEMO_THEMES.find(t => t.isActive) || DEMO_THEMES[0],
      },
      demo: true,
    });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { slug } = body;

    if (!slug) {
      return Response.json(
        { success: false, error: 'Missing required field: slug' },
        { status: 400 }
      );
    }

    // Deactivate all themes first
    await Theme.updateMany({}, { $set: { isActive: false } });

    // Activate the specified theme
    const theme = await Theme.findOneAndUpdate(
      { slug },
      { $set: { isActive: true } },
      { new: true }
    );

    if (!theme) {
      return Response.json(
        { success: false, error: 'Theme not found' },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: theme });
  } catch (error) {
    console.error('Error switching theme:', error);
    return Response.json(
      { success: false, error: 'Failed to switch theme' },
      { status: 500 }
    );
  }
}
