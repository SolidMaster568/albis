import { Reminder } from '../models/Reminder.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getFamilyForUser } from '../utils/familyAccess.js';

export const getReminders = asyncHandler(async (req, res) => {
  const familyId = await getFamilyForUser(req.user!.id);
  const reminders = await Reminder.find({ family: familyId, completed: false }).sort({ date: 1 });

  res.json(reminders);
});
