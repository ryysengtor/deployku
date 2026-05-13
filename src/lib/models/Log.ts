import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
  level: 'info' | 'warn' | 'error' | 'debug';
  action: string;
  message: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LogSchema = new Schema<ILog>(
  {
    level: { type: String, enum: ['info', 'warn', 'error', 'debug'], default: 'info' },
    action: { type: String, required: true },
    message: { type: String, required: true },
    userId: { type: String },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Log || mongoose.model<ILog>('Log', LogSchema);
