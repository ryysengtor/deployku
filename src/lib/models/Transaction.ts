import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  transactionId: string;
  productName: string;
  variantName: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  totalAmount: number;
  uniqueNominal: number;
  paymentMethod: 'qris' | 'ewallet' | 'bank_transfer' | 'manual';
  status: 'pending' | 'paid' | 'success' | 'expired' | 'cancel';
  qrString?: string;
  cashifyTransactionId?: string;
  proofOfPayment?: string;
  productId: string;
  variantLabel: string;
  expiredAt: Date;
  paidAt?: Date;
  canceledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    transactionId: { type: String, required: true, unique: true },
    productName: { type: String, required: true },
    variantName: { type: String, default: '' },
    variantLabel: { type: String, default: '' },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    amount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    uniqueNominal: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ['qris', 'ewallet', 'bank_transfer', 'manual'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'success', 'expired', 'cancel'],
      default: 'pending',
    },
    qrString: { type: String },
    cashifyTransactionId: { type: String },
    proofOfPayment: { type: String },
    productId: { type: String, required: true },
    expiredAt: { type: Date },
    paidAt: { type: Date },
    canceledAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
