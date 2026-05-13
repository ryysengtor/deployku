import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  type: 'telegram' | 'whatsapp' | 'email' | 'system';
  title: string;
  message: string;
  recipient: string;
  status: 'pending' | 'sent' | 'failed';
  relatedTransactionId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    type: { type: String, enum: ['telegram', 'whatsapp', 'email', 'system'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    recipient: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
    relatedTransactionId: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
