import { Activity } from '../models/Activity.js';
import { Notification } from '../models/Notification.js';
import { Task } from '../models/Task.js';
import { ApiError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getFamilyForUser } from '../utils/familyAccess.js';

export const getTasks = asyncHandler(async (req, res) => {
  const familyId = await getFamilyForUser(req.user!.id);
  const tasks = await Task.find({ family: familyId })
    .populate('assignedTo', 'name email avatar')
    .sort({ dueDate: 1 });

  res.json(tasks);
});

export const createTask = asyncHandler(async (req, res) => {
  const familyId = await getFamilyForUser(req.user!.id);
  const { title, description, priority, dueDate, assignedTo, status } = req.body;

  if (!title || !dueDate || !assignedTo) {
    throw new ApiError(400, 'Title, due date and assigned member are required');
  }

  const task = await Task.create({
    family: familyId,
    title,
    description,
    priority,
    dueDate,
    assignedTo,
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

  const populatedTask = await Task.findById(task._id).populate('assignedTo', 'name email avatar');
  res.status(201).json(populatedTask);
});

export const updateTask = asyncHandler(async (req, res) => {
  const familyId = await getFamilyForUser(req.user!.id);
  const task = await Task.findOneAndUpdate({ _id: req.params.id, family: familyId }, req.body, {
    new: true,
    runValidators: true
  }).populate('assignedTo', 'name email avatar');

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
