import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import { getDemoTransactions } from '@/lib/demo-data';

export async function GET() {
  try {
    await connectDB();

    const totalTransactions = await Transaction.countDocuments({});

    const revenueResult = await Transaction.aggregate([
      { $match: { status: { $in: ['paid', 'success'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const pendingCount = await Transaction.countDocuments({ status: 'pending' });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayCount = await Transaction.countDocuments({
      createdAt: { $gte: todayStart },
    });

    return Response.json({
      success: true,
      data: {
        totalTransactions,
        totalRevenue,
        pendingCount,
        todayCount,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats, using demo data:', error);
    const transactions = getDemoTransactions();
    return Response.json({
      success: true,
      data: {
        totalTransactions: transactions.length,
        totalRevenue: transactions.filter((t: any) => t.status === 'paid' || t.status === 'success').reduce((acc: number, t: any) => acc + (t.totalAmount || 0), 0),
        pendingCount: transactions.filter((t: any) => t.status === 'pending').length,
        todayCount: transactions.length,
      },
      demo: true,
    });
  }
}
