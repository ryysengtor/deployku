import mongoose, { Schema, Document } from 'mongoose';

export interface IFlashSale extends Document {
  productId: string;
  salePrice: number;
  originalPrice: number;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FlashSaleSchema = new Schema<IFlashSale>(
  {
    productId: { type: String, required: true },
    salePrice: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.FlashSale || mongoose.model<IFlashSale>('FlashSale', FlashSaleSchema);
