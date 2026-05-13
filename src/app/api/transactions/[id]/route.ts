import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import { findDemoTransaction, getDemoTransactions, updateDemoTransaction } from '@/lib/demo-data';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Try to find by MongoDB _id first, then by transactionId
    let transaction = null;

    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      transaction = await Transaction.findById(id);
    }

    if (!transaction) {
      transaction = await Transaction.findOne({ transactionId: id });
    }

    if (!transaction) {
      // Try demo data
      const demo = findDemoTransaction(id);
      if (demo) {
        return Response.json({ success: true, data: demo, demo: true });
      }
      return Response.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error fetching transaction, checking demo data:', error);
    const { id } = await params;
    const demo = findDemoTransaction(id);
    if (demo) {
      return Response.json({ success: true, data: demo, demo: true });
    }
    return Response.json(
      { success: false, error: 'Transaction not found' },
      { status: 404 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    let transaction = null;

    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      transaction = await Transaction.findByIdAndUpdate(
        id,
        { $set: body },
        { new: true, runValidators: true }
      );
    }

    if (!transaction) {
      transaction = await Transaction.findOneAndUpdate(
        { transactionId: id },
        { $set: body },
        { new: true, runValidators: true }
      );
    }

    if (!transaction) {
      // Try demo data
      const updated = updateDemoTransaction(id, body);
      if (updated) {
        return Response.json({ success: true, data: updated, demo: true });
      }
      return Response.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error updating transaction:', error);
    const { id } = await params;
    const body = await request.json();
    const updated = updateDemoTransaction(id, body);
    if (updated) {
      return Response.json({ success: true, data: updated, demo: true });
    }
    return Response.json(
      { success: false, error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}
