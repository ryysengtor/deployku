import mongoose, { Schema, Document } from 'mongoose';

export interface IManualPayment extends Document {
  transactionId: string;
  proofOfPayment: string; // base64 or URL
  bankName: string;
  accountName: string;
  accountNumber: string;
  transferAmount: number;
  status: 'pending_review' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ManualPaymentSchema = new Schema<IManualPayment>(
  {
    transactionId: { type: String, required: true, unique: true },
    proofOfPayment: { type: String, required: true },
    bankName: { type: String, default: '' },
    accountName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    transferAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['pending_review', 'approved', 'rejected'], default: 'pending_review' },
    reviewedBy: { type: String },
    reviewedAt: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.ManualPayment || mongoose.model<IManualPayment>('ManualPayment', ManualPaymentSchema);
