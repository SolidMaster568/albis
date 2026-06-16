import { Notification } from '../models/Notification.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getFamilyForUser } from '../utils/familyAccess.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const familyId = await getFamilyForUser(req.user!.id);
  const notifications = await Notification.find({ family: familyId, user: req.user!.id })
    .sort({ createdAt: -1 })
    .limit(20);

  res.json(notifications);
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const familyId = await getFamilyForUser(req.user!.id);
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, family: familyId, user: req.user!.id },
    { read: true },
    { new: true }
  );

  res.json(notification);
});
