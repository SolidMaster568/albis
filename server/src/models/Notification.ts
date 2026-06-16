import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export type NotificationType = 'Task Assignment' | 'Event Reminder' | 'Activity Update';

export interface INotification extends Document {
  family: Types.ObjectId;
  user: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
}

const notificationSchema = new Schema<INotification>(
  {
    family: { type: Schema.Types.ObjectId, ref: 'Family', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Task Assignment', 'Event Reminder', 'Activity Update'],
      required: true
    },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Notification: Model<INotification> = mongoose.model<INotification>(
  'Notification',
  notificationSchema
);
