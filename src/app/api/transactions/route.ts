import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import { getDemoTransactions } from '@/lib/demo-data';

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const filter: Record<string, unknown> = {};

    if (transactionId) {
      filter.transactionId = transactionId;
    }

    const transactions = await Transaction.find(filter).sort({ createdAt: -1 }).limit(limit);

    return Response.json({ success: true, data: transactions });
  } catch (error) {
    console.error('Error fetching transactions, using demo data:', error);
    return Response.json({ success: true, data: getDemoTransactions(), demo: true });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      transactionId,
      productName,
      variantName,
      variantLabel,
      customerName,
      customerPhone,
      amount,
      totalAmount,
      uniqueNominal,
      paymentMethod,
      status,
      qrString,
      cashifyTransactionId,
      productId,
      expiredAt,
    } = body;

    if (!transactionId || !productName || !customerName || !customerPhone || !amount || !paymentMethod || !productId) {
      return Response.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const transaction = await Transaction.create({
      transactionId,
      productName,
      variantName: variantName || '',
      variantLabel: variantLabel || '',
      customerName,
      customerPhone,
      amount,
      totalAmount: totalAmount || amount,
      uniqueNominal: uniqueNominal || 0,
      paymentMethod,
      status: status || 'pending',
      qrString,
      cashifyTransactionId,
      productId,
      expiredAt: expiredAt ? new Date(expiredAt) : new Date(Date.now() + 15 * 60 * 1000),
    });

    return Response.json({ success: true, data: transaction }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return Response.json(
      { success: false, error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
