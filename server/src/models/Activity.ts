import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export interface IActivity extends Document {
  family: Types.ObjectId;
  action: string;
  user: Types.ObjectId;
  timestamp: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    family: { type: Schema.Types.ObjectId, ref: 'Family', required: true, index: true },
    action: { type: String, required: true, trim: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Activity: Model<IActivity> = mongoose.model<IActivity>('Activity', activitySchema);
