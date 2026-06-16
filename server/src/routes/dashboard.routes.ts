import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);
dashboardRouter.get('/summary', getDashboardSummary);
