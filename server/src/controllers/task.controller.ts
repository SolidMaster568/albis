import { Types } from 'mongoose';
import { Activity } from '../models/Activity.js';
import { Event } from '../models/Event.js';
import { Notification } from '../models/Notification.js';
import { Task } from '../models/Task.js';
import { ApiError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getFamilyForUser } from '../utils/familyAccess.js';

const taskPopulate = [
  { path: 'assignedTo', select: 'name email avatar' },
  { path: 'relatedEvent', select: 'title date type' }
];

const resolveRelatedEvent = async (relatedEvent: unknown, familyId: Types.ObjectId) => {
  if (!relatedEvent) {
    return null;
  }

  if (typeof relatedEvent !== 'string' || !Types.ObjectId.isValid(relatedEvent)) {
    throw new ApiError(400, 'Related event is invalid');
  }

  const event = await Event.findOne({ _id: relatedEvent, family: familyId }).select('_id');

  if (!event) {
    throw new ApiError(400, 'Related event must belong to this family');
  }

  return event._id;
};

export const getTasks = asyncHandler(async (req, res) => {
  const familyId = await getFamilyForUser(req.user!.id);
  const tasks = await Task.find({ family: familyId })
    .populate(taskPopulate)
    .sort({ dueDate: 1 });

  res.json(tasks);
});

export const createTask = asyncHandler(async (req, res) => {
  const familyId = await getFamilyForUser(req.user!.id);
  const { title, description, priority, dueDate, assignedTo, status, relatedEvent } = req.body;

  if (!title || !dueDate || !assignedTo) {
    throw new ApiError(400, 'Title, due date and assigned member are required');
  }

  const resolvedRelatedEvent = await resolveRelatedEvent(relatedEvent, familyId);

  const task = await Task.create({
    family: familyId,
    title,
    description,
    priority,
    dueDate,
    assignedTo,
    relatedEvent: resolvedRelatedEvent,
    status,
    createdBy: req.user!.id
  });

  await Activity.create({
    family: familyId,
    user: req.user!.id,
    action: `Created task "${task.title}"`
  });

  await Notification.create({
    family: familyId,
    user: assignedTo,
    title: 'New task assigned',
    message: task.title,
    type: 'Task Assignment'
  });

  const populatedTask = await Task.findById(task._id).populate(taskPopulate);
  res.status(201).json(populatedTask);
});

export const updateTask = asyncHandler(async (req, res) => {
  const familyId = await getFamilyForUser(req.user!.id);
  const updates = { ...req.body };

  if (Object.prototype.hasOwnProperty.call(updates, 'relatedEvent')) {
    updates.relatedEvent = await resolveRelatedEvent(updates.relatedEvent, familyId);
  }

  const task = await Task.findOneAndUpdate({ _id: req.params.id, family: familyId }, updates, {
    new: true,
    runValidators: true
  }).populate(taskPopulate);

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  await Activity.create({
    family: familyId,
    user: req.user!.id,
    action: `Updated task "${task.title}"`
  });

  res.json(task);
});

export const deleteTask = asyncHandler(async (req, res) => {
  const familyId = await getFamilyForUser(req.user!.id);
  const task = await Task.findOneAndDelete({ _id: req.params.id, family: familyId });

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  await Activity.create({
    family: familyId,
    user: req.user!.id,
    action: `Deleted task "${task.title}"`
  });

  res.status(204).send();
});
