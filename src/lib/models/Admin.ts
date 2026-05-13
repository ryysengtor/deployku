import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  username: string;
  password: string;
  role: 'superadmin' | 'admin' | 'viewer';
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'admin', 'viewer'], default: 'admin' },
    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);
