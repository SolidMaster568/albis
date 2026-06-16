import { Router } from 'express';
import { chatWithAssistant } from '../controllers/assistant.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const assistantRouter = Router();

assistantRouter.use(requireAuth);
assistantRouter.post('/chat', chatWithAssistant);
