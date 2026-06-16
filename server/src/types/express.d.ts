import type { Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
      familyId?: Types.ObjectId;
    }
  }
}

export {};
