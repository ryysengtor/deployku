import connectDB from '@/lib/mongodb';
import Banner from '@/lib/models/Banner';
import { DEMO_BANNERS } from '@/lib/demo-data';

export async function GET() {
  try {
    await connectDB();

    const banners = await Banner.find({ isActive: true }).sort({ sortOrder: 1 });

    return Response.json({ success: true, data: banners });
  } catch (error) {
    console.error('Error fetching banners, using demo data:', error);
    return Response.json({ success: true, data: DEMO_BANNERS, demo: true });
  }
}
