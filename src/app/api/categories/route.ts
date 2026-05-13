import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import { DEMO_CATEGORIES } from '@/lib/demo-data';

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 });

    return Response.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories, using demo data:', error);
    return Response.json({ success: true, data: DEMO_CATEGORIES, demo: true });
  }
}
