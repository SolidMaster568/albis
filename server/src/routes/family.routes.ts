import { Router } from 'express';
import {
  createFamily,
  getCurrentFamily,
  inviteMember,
  updateMemberRole
} from '../controllers/family.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const familyRouter = Router();

familyRouter.use(requireAuth);
familyRouter.get('/current', getCurrentFamily);
familyRouter.post('/', createFamily);
familyRouter.post('/invite', inviteMember);
familyRouter.put('/members/:userId/role', updateMemberRole);
