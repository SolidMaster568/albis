import { Router } from 'express';
import {
  forgotPassword,
  getProfile,
  login,
  register,
  updateProfile
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/forgot-password', forgotPassword);
authRouter.get('/me', requireAuth, getProfile);
authRouter.put('/profile', requireAuth, updateProfile);
