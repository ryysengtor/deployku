import connectDB from '@/lib/mongodb';
import Settings from '@/lib/models/Settings';
import { DEMO_SETTINGS } from '@/lib/demo-data';

export async function GET() {
  try {
    await connectDB();

    const settings = await Settings.find({});

    const settingsObj: Record<string, string> = {};
    settings.forEach((setting) => {
      settingsObj[setting.key] = setting.value;
    });

    return Response.json({ success: true, data: settingsObj });
  } catch (error) {
    console.error('Error fetching settings, using demo data:', error);
    return Response.json({ success: true, data: DEMO_SETTINGS, demo: true });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    let updates: Record<string, string> = {};

    if (body.key && body.value !== undefined) {
      updates = { [body.key]: String(body.value) };
    } else if (typeof body === 'object' && !body.key) {
      updates = body;
    } else {
      return Response.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const bulkOps = Object.entries(updates).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: {
          $set: { value: String(value) },
        },
        upsert: true,
      },
    }));

    await Settings.bulkWrite(bulkOps);

    const updatedSettings = await Settings.find({});
    const settingsObj: Record<string, string> = {};
    updatedSettings.forEach((setting) => {
      settingsObj[setting.key] = setting.value;
    });

    return Response.json({ success: true, data: settingsObj });
  } catch (error) {
    console.error('Error updating settings:', error);
    return Response.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
