import { Event } from '../models/Event.js';
import { Reminder } from '../models/Reminder.js';
import { Task } from '../models/Task.js';
import { ApiError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { buildMockAssistantResponse } from '../services/ai.service.js';
import { getFamilyForUser } from '../utils/familyAccess.js';

const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

export const chatWithAssistant = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    throw new ApiError(400, 'Prompt is required');
  }

  const familyId = await getFamilyForUser(req.user!.id);
  const today = new Date();
  const nextWeek = addDays(today, 7);

  const [tasks, events, reminders] = await Promise.all([
    Task.find({ family: familyId, dueDate: { $gte: today, $lte: nextWeek } }).sort({ dueDate: 1 }),
    Event.find({ family: familyId, date: { $gte: today, $lte: nextWeek } }).sort({ date: 1 }),
    Reminder.find({
      family: familyId,
      completed: false,
      date: { $gte: today, $lte: nextWeek }
    }).sort({ date: 1 })
  ]);

  res.json(buildMockAssistantResponse(prompt, { tasks, events, reminders }));
});
