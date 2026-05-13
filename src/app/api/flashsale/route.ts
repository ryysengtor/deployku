import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { DEMO_PRODUCTS } from '@/lib/demo-data';

export async function GET() {
  try {
    await connectDB();

    const now = new Date();

    const products = await Product.find({
      isFlashSale: true,
      flashSaleEndTime: { $gt: now },
      isActive: true,
    }).sort({ sortOrder: 1 });

    const productsWithCountdown = products.map((product) => {
      const obj = product.toObject();
      const endTime = new Date(obj.flashSaleEndTime!);
      const timeRemaining = Math.max(0, endTime.getTime() - now.getTime());

      return {
        ...obj,
        countdown: {
          total: timeRemaining,
          hours: Math.floor(timeRemaining / (1000 * 60 * 60)),
          minutes: Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((timeRemaining % (1000 * 60)) / 1000),
          isExpired: timeRemaining <= 0,
        },
      };
    });

    return Response.json({ success: true, data: productsWithCountdown });
  } catch (error) {
    console.error('Error fetching flash sale, using demo data:', error);
    // Fallback to demo data
    const now = new Date();
    const flashProducts = DEMO_PRODUCTS.filter(p => {
      if (!p.isFlashSale) return false;
      if (!p.flashSaleEndTime) return false;
      return new Date(p.flashSaleEndTime).getTime() > now.getTime();
    }).map(p => {
      const endTime = new Date(p.flashSaleEndTime!);
      const timeRemaining = Math.max(0, endTime.getTime() - now.getTime());
      return {
        ...p,
        countdown: {
          total: timeRemaining,
          hours: Math.floor(timeRemaining / (1000 * 60 * 60)),
          minutes: Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((timeRemaining % (1000 * 60)) / 1000),
          isExpired: timeRemaining <= 0,
        },
      };
    });

    return Response.json({ success: true, data: flashProducts, demo: true });
  }
}
