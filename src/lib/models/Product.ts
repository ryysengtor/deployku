import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  image: string;
  price: number;
  originalPrice?: number;
  category: string;
  variants: IVariant[];
  stock: number;
  isActive: boolean;
  isFlashSale: boolean;
  flashSalePrice?: number;
  flashSaleEndTime?: Date;
  sortOrder: number;
  // Digital product delivery
  deliveryType: 'auto' | 'manual' | 'link' | 'file';
  downloadLink?: string;
  googleDriveLink?: string;
  filePath?: string;
  fileName?: string;
  fileData?: string;
  accessInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVariant {
  name: string;
  options: IVariantOption[];
}

export interface IVariantOption {
  label: string;
  price: number;
  stock: number;
  downloadLink?: string;
  googleDriveLink?: string;
  filePath?: string;
  accessInstructions?: string;
}

const VariantOptionSchema = new Schema({
  label: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 999 },
  downloadLink: { type: String },
  googleDriveLink: { type: String },
  filePath: { type: String },
  accessInstructions: { type: String },
});

const VariantSchema = new Schema({
  name: { type: String, required: true },
  options: [VariantOptionSchema],
});

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    category: { type: String, default: 'uncategorized' },
    variants: [VariantSchema],
    stock: { type: Number, default: 999 },
    isActive: { type: Boolean, default: true },
    isFlashSale: { type: Boolean, default: false },
    flashSalePrice: { type: Number },
    flashSaleEndTime: { type: Date },
    sortOrder: { type: Number, default: 0 },
    deliveryType: { type: String, enum: ['auto', 'manual', 'link', 'file'], default: 'auto' },
    downloadLink: { type: String },
    googleDriveLink: { type: String },
    filePath: { type: String },
    fileName: { type: String },
    fileData: { type: String },
    accessInstructions: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
