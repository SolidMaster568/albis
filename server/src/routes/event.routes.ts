import { Router } from 'express';
import { createEvent, getEvents } from '../controllers/event.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const eventRouter = Router();

eventRouter.use(requireAuth);
eventRouter.get('/', getEvents);
eventRouter.post('/', createEvent);
