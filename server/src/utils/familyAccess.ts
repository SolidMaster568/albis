import type { Types } from 'mongoose';
import { Family } from '../models/Family.js';
import { ApiError } from '../middleware/errorHandler.js';

export const getFamilyForUser = async (userId: string): Promise<Types.ObjectId> => {
  const family = await Family.findOne({ 'members.user': userId }).select('_id');

  if (!family) {
    throw new ApiError(404, 'No family found for this account');
  }

  return family._id;
};

export const ensureFamilyMember = async (familyId: Types.ObjectId, userId: string) => {
  const family = await Family.findOne({ _id: familyId, 'members.user': userId });

  if (!family) {
    throw new ApiError(403, 'You do not have access to this family');
  }

  return family;
};
