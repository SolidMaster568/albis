import { Router } from 'express';
import { createTask, deleteTask, getTasks, updateTask } from '../controllers/task.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const taskRouter = Router();

taskRouter.use(requireAuth);
taskRouter.get('/', getTasks);
taskRouter.post('/', createTask);
taskRouter.put('/:id', updateTask);
taskRouter.delete('/:id', deleteTask);
