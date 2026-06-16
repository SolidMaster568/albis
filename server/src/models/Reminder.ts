import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export interface IReminder extends Document {
  family: Types.ObjectId;
  title: string;
  message: string;
  date: Date;
  completed: boolean;
}

const reminderSchema = new Schema<IReminder>(
  {
    family: { type: Schema.Types.ObjectId, ref: 'Family', required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Reminder: Model<IReminder> = mongoose.model<IReminder>('Reminder', reminderSchema);
