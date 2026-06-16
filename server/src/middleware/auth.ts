import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Family } from '../models/Family.js';
import { ApiError } from './errorHandler.js';
import { asyncHandler } from './asyncHandler.js';

type TokenPayload = {
  id: string;
  email: string;
};

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    throw new ApiError(401, 'Authentication required');
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as TokenPayload;
    req.user = { id: payload.id, email: payload.email };

    const family = await Family.findOne({ 'members.user': payload.id }).select('_id');
    if (family) {
      req.familyId = family._id;
    }

    next();
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }
});
