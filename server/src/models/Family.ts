import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export type FamilyRole = 'Parent' | 'Partner' | 'Child';

export interface IFamilyMember {
  user: Types.ObjectId;
  role: FamilyRole;
  joinedAt: Date;
}

export interface IFamily extends Document {
  name: string;
  owner: Types.ObjectId;
  members: IFamilyMember[];
}

const familyMemberSchema = new Schema<IFamilyMember>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['Parent', 'Partner', 'Child'], required: true },
    joinedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const familySchema = new Schema<IFamily>(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: { type: [familyMemberSchema], default: [] }
  },
  { timestamps: true }
);

export const Family: Model<IFamily> = mongoose.model<IFamily>('Family', familySchema);
