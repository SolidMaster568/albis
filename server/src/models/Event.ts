import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export type EventType = 'School Event' | 'Medical Appointment' | 'Birthday' | 'Activity';

export interface IEvent extends Document {
  family: Types.ObjectId;
  title: string;
  description?: string;
  date: Date;
  type: EventType;
}

const eventSchema = new Schema<IEvent>(
  {
    family: { type: Schema.Types.ObjectId, ref: 'Family', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ['School Event', 'Medical Appointment', 'Birthday', 'Activity'],
      default: 'Activity'
    }
  },
  { timestamps: true }
);

export const Event: Model<IEvent> = mongoose.model<IEvent>('Event', eventSchema);
