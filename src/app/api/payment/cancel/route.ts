import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import { cancelTransaction } from '@/lib/cashify';
import { findDemoTransaction, updateDemoTransaction } from '@/lib/demo-data';

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { transactionId } = body;

    if (!transactionId) {
      return Response.json(
        { success: false, error: 'Missing required field: transactionId' },
        { status: 400 }
      );
    }

    let transaction: any = await Transaction.findOne({ transactionId });

    // Fallback to demo data
    if (!transaction) {
      const demoTx = findDemoTransaction(transactionId);
      if (demoTx) {
        transaction = demoTx;
      }
    }

    if (!transaction) {
      return Response.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (transaction.status !== 'pending') {
      return Response.json(
        { success: false, error: `Cannot cancel transaction with status: ${transaction.status}` },
        { status: 400 }
      );
    }

    const hasCashifyKey = !!process.env.CASHIFY_LICENSE_KEY;

    // transactionId IS the Cashify ID now - use it directly
    if (hasCashifyKey) {
      const cashifyTxId = transaction.cashifyTransactionId || transactionId;
      console.log('[Payment Cancel] Cancelling Cashify transaction:', {
        transactionId,
        cashifyTxId,
      });
      try {
        await cancelTransaction(cashifyTxId);
      } catch (cashifyError) {
        console.error('[Payment Cancel] Cashify cancel error:', cashifyError);
        // Still proceed with local cancellation
      }
    }

    // Update transaction status locally
    try {
      await Transaction.findByIdAndUpdate(transaction._id, {
        $set: {
          status: 'cancel',
          canceledAt: new Date(),
        },
      });
    } catch {
      // Fallback to demo update
      updateDemoTransaction(transactionId, {
        status: 'cancel',
        canceledAt: new Date().toISOString(),
      });
    }

    console.log('[Payment Cancel] Transaction cancelled:', { transactionId });

    return Response.json({
      success: true,
      data: {
        transactionId: transaction.transactionId,
        status: 'cancel',
        canceledAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error cancelling payment:', error);
    return Response.json(
      { success: false, error: 'Failed to cancel payment' },
      { status: 500 }
    );
  }
}
