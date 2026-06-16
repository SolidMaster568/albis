import { Router } from 'express';
import {
  getNotifications,
  markNotificationRead
} from '../controllers/notification.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const notificationRouter = Router();

notificationRouter.use(requireAuth);
notificationRouter.get('/', getNotifications);
notificationRouter.put('/:id/read', markNotificationRead);
