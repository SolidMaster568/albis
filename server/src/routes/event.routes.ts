import { Router } from 'express';
import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent
} from '../controllers/event.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const eventRouter = Router();

eventRouter.use(requireAuth);
eventRouter.get('/', getEvents);
eventRouter.post('/', createEvent);
eventRouter.put('/:id', updateEvent);
eventRouter.delete('/:id', deleteEvent);
