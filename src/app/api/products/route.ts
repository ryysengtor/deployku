import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { DEMO_PRODUCTS } from '@/lib/demo-data';

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const flashSale = searchParams.get('flashSale');

    const filter: Record<string, unknown> = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (flashSale === 'true') {
      filter.isFlashSale = true;
      filter.flashSaleEndTime = { $gt: new Date() };
    }

    const products = await Product.find(filter).sort({ sortOrder: 1, createdAt: -1 });

    return Response.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching products, using demo data:', error);
    // Fallback to demo data
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const flashSale = searchParams.get('flashSale');

    let filtered = [...DEMO_PRODUCTS];

    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }

    if (flashSale === 'true') {
      filtered = filtered.filter(p => p.isFlashSale);
    }

    return Response.json({ success: true, data: filtered, demo: true });
  }
}
