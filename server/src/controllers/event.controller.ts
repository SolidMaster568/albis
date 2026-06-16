import { Activity } from '../models/Activity.js';
import { Event } from '../models/Event.js';
import { Notification } from '../models/Notification.js';
import { ApiError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getFamilyForUser } from '../utils/familyAccess.js';
import { Family } from '../models/Family.js';

export const getEvents = asyncHandler(async (req, res) => {
  const familyId = await getFamilyForUser(req.user!.id);
  const events = await Event.find({ family: familyId }).sort({ date: 1 });

  res.json(events);
});

export const createEvent = asyncHandler(async (req, res) => {
  const familyId = await getFamilyForUser(req.user!.id);
  const { title, description, date, type } = req.body;

  if (!title || !date || !type) {
    throw new ApiError(400, 'Title, date and type are required');
  }

  const event = await Event.create({
    family: familyId,
    title,
    description,
    date,
    type
  });

  await Activity.create({
    family: familyId,
    user: req.user!.id,
    action: `Added event "${event.title}"`
  });

  const family = await Family.findById(familyId);
  const notifications =
    family?.members.map((member) => ({
      family: familyId,
      user: member.user,
      title: 'New family event',
      message: event.title,
      type: 'Event Reminder' as const
    })) ?? [];

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  res.status(201).json(event);
});
