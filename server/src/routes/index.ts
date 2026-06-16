import { Router } from 'express';
import { assistantRouter } from './assistant.routes.js';
import { authRouter } from './auth.routes.js';
import { dashboardRouter } from './dashboard.routes.js';
import { eventRouter } from './event.routes.js';
import { familyRouter } from './family.routes.js';
import { notificationRouter } from './notification.routes.js';
import { reminderRouter } from './reminder.routes.js';
import { taskRouter } from './task.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/families', familyRouter);
apiRouter.use('/tasks', taskRouter);
apiRouter.use('/events', eventRouter);
apiRouter.use('/reminders', reminderRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/assistant', assistantRouter);
apiRouter.use('/notifications', notificationRouter);
