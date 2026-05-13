import connectDB from '@/lib/mongodb';
import Voucher from '@/lib/models/Voucher';

export async function GET() {
  try {
    await connectDB();

    const vouchers = await Voucher.find({ isActive: true }).sort({ createdAt: -1 });

    return Response.json({ success: true, data: vouchers });
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch vouchers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { code, amount } = body;

    if (!code) {
      return Response.json(
        { success: false, error: 'Missing required field: code' },
        { status: 400 }
      );
    }

    const voucher = await Voucher.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!voucher) {
      return Response.json(
        { success: false, error: 'Voucher not found or inactive' },
        { status: 404 }
      );
    }

    // Check expiry
    if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
      return Response.json(
        { success: false, error: 'Voucher has expired' },
        { status: 400 }
      );
    }

    // Check usage limit
    if (voucher.usedCount >= voucher.maxUses) {
      return Response.json(
        { success: false, error: 'Voucher usage limit reached' },
        { status: 400 }
      );
    }

    // Check minimum purchase
    if (amount && amount < voucher.minPurchase) {
      return Response.json(
        { success: false, error: `Minimum purchase amount is ${voucher.minPurchase}` },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    const purchaseAmount = amount || 0;

    if (voucher.discountType === 'percentage') {
      discountAmount = (purchaseAmount * voucher.discount) / 100;
    } else {
      discountAmount = voucher.discount;
    }

    // Ensure discount doesn't exceed purchase amount
    discountAmount = Math.min(discountAmount, purchaseAmount);

    return Response.json({
      success: true,
      data: {
        code: voucher.code,
        discount: voucher.discount,
        discountType: voucher.discountType,
        discountAmount,
        minPurchase: voucher.minPurchase,
        finalAmount: Math.max(0, purchaseAmount - discountAmount),
      },
    });
  } catch (error) {
    console.error('Error validating voucher:', error);
    return Response.json(
      { success: false, error: 'Failed to validate voucher' },
      { status: 500 }
    );
  }
}
