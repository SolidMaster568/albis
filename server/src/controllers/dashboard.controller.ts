import { Activity } from '../models/Activity.js';
import { Event } from '../models/Event.js';
import { Reminder } from '../models/Reminder.js';
import { Task } from '../models/Task.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getFamilyForUser } from '../utils/familyAccess.js';

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const familyId = await getFamilyForUser(req.user!.id);
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const inTwoWeeks = addDays(today, 14);

  const [todayTasks, upcomingEvents, pendingReminders, activityFeed, allTasks, eventsForChart] =
    await Promise.all([
      Task.find({ family: familyId, dueDate: { $gte: today, $lt: tomorrow } })
        .populate('assignedTo', 'name email avatar')
        .sort({ priority: -1 }),
      Event.find({ family: familyId, date: { $gte: today, $lte: inTwoWeeks } }).sort({ date: 1 }),
      Reminder.find({
        family: familyId,
        completed: false,
        date: { $gte: today, $lte: inTwoWeeks }
      }).sort({ date: 1 }),
      Activity.find({ family: familyId }).populate('user', 'name avatar').sort({ timestamp: -1 }).limit(10),
      Task.find({ family: familyId }),
      Event.find({ family: familyId, date: { $gte: today, $lte: inTwoWeeks } })
    ]);

  const taskCompletion = ['Pending', 'In Progress', 'Completed'].map((status) => ({
    name: status,
    value: allTasks.filter((task) => task.status === status).length
  }));

  const upcomingEventsChart = eventsForChart.reduce<Record<string, number>>((acc, event) => {
    acc[event.type] = (acc[event.type] ?? 0) + 1;
    return acc;
  }, {});

  res.json({
    todayTasks,
    upcomingEvents,
    pendingReminders,
    activityFeed,
    charts: {
      taskCompletion,
      upcomingEvents: Object.entries(upcomingEventsChart).map(([name, value]) => ({ name, value }))
    }
  });
});
