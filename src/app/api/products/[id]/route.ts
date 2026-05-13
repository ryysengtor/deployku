import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { DEMO_PRODUCTS } from '@/lib/demo-data';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const product = await Product.findById(id);

    if (!product) {
      return Response.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product, using demo data:', error);
    // Fallback to demo data
    const { id } = await params;
    const product = DEMO_PRODUCTS.find(p => p._id === id);

    if (!product) {
      return Response.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: product, demo: true });
  }
}
