import mongoose, { Schema, Document } from 'mongoose';

export interface IVoucher extends Document {
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  minPurchase: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VoucherSchema = new Schema<IVoucher>(
  {
    code: { type: String, required: true, unique: true },
    discount: { type: Number, required: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    minPurchase: { type: Number, default: 0 },
    maxUses: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Voucher || mongoose.model<IVoucher>('Voucher', VoucherSchema);
