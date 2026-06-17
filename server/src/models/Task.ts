import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface ITask extends Document {
  family: Types.ObjectId;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate: Date;
  status: TaskStatus;
  assignedTo: Types.ObjectId;
  relatedEvent?: Types.ObjectId | null;
  createdBy: Types.ObjectId;
}

const taskSchema = new Schema<ITask>(
  {
    family: { type: Schema.Types.ObjectId, ref: 'Family', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending'
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    relatedEvent: { type: Schema.Types.ObjectId, ref: 'Event', default: null, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export const Task: Model<ITask> = mongoose.model<ITask>('Task', taskSchema);
