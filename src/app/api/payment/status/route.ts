import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import Product from '@/lib/models/Product';
import { checkTransactionStatus } from '@/lib/cashify';
import { notifyPaymentConfirmed, notifyPaymentExpired } from '@/lib/notifications';
import { DEMO_PRODUCTS, findDemoTransaction, updateDemoTransaction } from '@/lib/demo-data';

/**
 * Map Cashify payment status to our internal status.
 *
 * Cashify status values:
 *   "PAID", "SETTLED", "SUCCESS" → our "paid"
 *   "EXPIRED"                   → our "expired"
 *   "CANCELLED"                 → our "cancel"
 *   "PENDING" or anything else  → null (no change, still pending)
 */
function mapCashifyStatus(cashifyStatus: string): string | null {
  const upper = (cashifyStatus || '').toUpperCase().trim();
  if (upper === 'PAID' || upper === 'SETTLED' || upper === 'SUCCESS') {
    return 'paid';
  }
  if (upper === 'EXPIRED') {
    return 'expired';
  }
  if (upper === 'CANCELLED' || upper === 'CANCEL') {
    return 'cancel';
  }
  // PENDING or unknown → no status change
  return null;
}

async function getProductDeliveryInfo(productId: string) {
  try {
    const product = await Product.findById(productId);
    if (product) {
      return {
        downloadLink: product.downloadLink || undefined,
        googleDriveLink: product.googleDriveLink || undefined,
        accessInstructions: product.accessInstructions || undefined,
        deliveryType: product.deliveryType || undefined,
      };
    }
  } catch {
    // Fallback to demo data
    const demoProduct = DEMO_PRODUCTS.find(p => p._id === productId);
    if (demoProduct) {
      return {
        downloadLink: demoProduct.downloadLink || undefined,
        googleDriveLink: demoProduct.googleDriveLink || undefined,
        accessInstructions: demoProduct.accessInstructions || undefined,
        deliveryType: demoProduct.deliveryType || undefined,
      };
    }
  }
  return null;
}

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

    // Find our transaction by transactionId (which is now the Cashify real ID)
    let transaction: any = await Transaction.findOne({ transactionId });

    // Fallback to demo data if DB lookup fails
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

    const hasCashifyKey = !!process.env.CASHIFY_LICENSE_KEY;
    let updatedStatus = transaction.status;
    let statusJustChanged = false;

    // transactionId IS the Cashify transactionId now
    // Use it directly to check payment status with Cashify
    if (hasCashifyKey) {
      // Use cashifyTransactionId if stored, otherwise use transactionId directly
      const cashifyTxId = transaction.cashifyTransactionId || transactionId;

      console.log('[Payment Status] Checking Cashify for transaction:', {
        transactionId,
        cashifyTxId,
        currentStatus: transaction.status,
      });

      try {
        const cashifyResult = await checkTransactionStatus(cashifyTxId);

        console.log('[Payment Status] Cashify check result:', {
          httpStatus: cashifyResult.httpStatus,
          extractedStatus: cashifyResult.extractedStatus,
          hasRawData: !!cashifyResult.raw,
        });

        // The checkTransactionStatus returns { raw, extractedStatus, httpStatus }
        if (cashifyResult.extractedStatus) {
          const mappedStatus = mapCashifyStatus(cashifyResult.extractedStatus);
          console.log('[Payment Status] Status mapping:', {
            cashifyExtracted: cashifyResult.extractedStatus,
            mappedTo: mappedStatus,
          });
          if (mappedStatus) {
            updatedStatus = mappedStatus;
          }
        } else if (cashifyResult.raw) {
          // If extractedStatus is null, try to parse the raw response ourselves
          const raw = cashifyResult.raw;
          const possibleStatus =
            raw?.data?.status ||
            raw?.data?.transactionStatus ||
            raw?.data?.paymentStatus ||
            raw?.transactionStatus ||
            raw?.status ||
            null;

          // Only map if the status looks like a Cashify payment status (not an HTTP status code)
          if (possibleStatus && typeof possibleStatus === 'string' && isNaN(Number(possibleStatus))) {
            const mappedStatus = mapCashifyStatus(possibleStatus);
            console.log('[Payment Status] Fallback status mapping:', {
              rawField: possibleStatus,
              mappedTo: mappedStatus,
            });
            if (mappedStatus) {
              updatedStatus = mappedStatus;
            }
          }
        }
      } catch (cashifyError) {
        console.error('[Payment Status] Cashify status check error:', cashifyError);
      }
    } else {
      console.log('[Payment Status] No Cashify key, skipping status check');
    }

    // Update transaction if status changed
    if (updatedStatus !== transaction.status) {
      statusJustChanged = true;
      const updateData: Record<string, unknown> = { status: updatedStatus };
      if (updatedStatus === 'paid') {
        updateData.paidAt = new Date();
      }
      if (updatedStatus === 'cancel') {
        updateData.canceledAt = new Date();
      }

      console.log('[Payment Status] Status changed:', {
        from: transaction.status,
        to: updatedStatus,
        transactionId,
      });

      try {
        await Transaction.findByIdAndUpdate(transaction._id, { $set: updateData });
      } catch {
        // Fallback to demo update
        updateDemoTransaction(transactionId, updateData);
      }

      // Send notification on status change
      const notifData = {
        transactionId: transaction.transactionId,
        productName: transaction.productName,
        variantLabel: transaction.variantLabel || undefined,
        customerName: transaction.customerName,
        customerPhone: transaction.customerPhone,
        totalAmount: transaction.totalAmount,
        paymentMethod: transaction.paymentMethod,
        status: updatedStatus,
      };

      if (updatedStatus === 'paid') {
        notifyPaymentConfirmed(notifData).catch(err => console.error('Payment confirmed notification error:', err));
      } else if (updatedStatus === 'expired' || updatedStatus === 'cancel') {
        notifyPaymentExpired(notifData).catch(err => console.error('Payment expired notification error:', err));
      }
    }

    // Fetch delivery info when status is 'paid'
    let deliveryInfo = null;
    if (updatedStatus === 'paid' && transaction.productId) {
      deliveryInfo = await getProductDeliveryInfo(transaction.productId);
    }

    // Fetch updated transaction from DB if possible
    let updatedTransaction: any = null;
    try {
      updatedTransaction = await Transaction.findById(transaction._id);
    } catch {
      // Use the in-memory state
      updatedTransaction = { ...transaction, status: updatedStatus };
    }

    return Response.json({
      success: true,
      data: {
        transactionId: updatedTransaction?.transactionId || transaction.transactionId,
        status: updatedStatus,
        amount: updatedTransaction?.amount || transaction.amount,
        totalAmount: updatedTransaction?.totalAmount || transaction.totalAmount,
        paidAt: updatedTransaction?.paidAt || transaction.paidAt,
        expiredAt: updatedTransaction?.expiredAt || transaction.expiredAt,
        isMock: !hasCashifyKey,
        deliveryInfo,
        statusChanged: statusJustChanged,
      },
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return Response.json(
      { success: false, error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}
