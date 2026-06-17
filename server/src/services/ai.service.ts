import type { HydratedDocument } from 'mongoose';
import type { IEvent } from '../models/Event.js';
import type { IReminder } from '../models/Reminder.js';
import type { ITask } from '../models/Task.js';

type AssistantSummaryInput = {
  tasks: HydratedDocument<ITask>[];
  events: HydratedDocument<IEvent>[];
  reminders: HydratedDocument<IReminder>[];
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);

export const buildMockAssistantResponse = (
  prompt: string,
  { tasks, events, reminders }: AssistantSummaryInput
) => {
  const pendingTasks = tasks.filter((task) => task.status !== 'Completed').slice(0, 4);
  const upcomingEvents = events.slice(0, 4);
  const upcomingReminders = reminders.slice(0, 4);
  const linkedPreparation = pendingTasks
    .map((task) => {
      const relatedEvent = events.find(
        (event) => task.relatedEvent?.toString() === event._id.toString()
      );

      return relatedEvent ? `${task.title} supports ${relatedEvent.title}` : null;
    })
    .filter((item): item is string => Boolean(item))
    .slice(0, 3);

  const taskSummary =
    pendingTasks.length > 0
      ? pendingTasks
          .map((task) => `${task.title} (${task.priority}, due ${formatDate(task.dueDate)})`)
          .join('; ')
      : 'No open tasks are due soon';

  const eventSummary =
    upcomingEvents.length > 0
      ? upcomingEvents.map((event) => `${event.title} on ${formatDate(event.date)}`).join('; ')
      : 'No family events are scheduled soon';

  const reminderSummary =
    upcomingReminders.length > 0
      ? upcomingReminders
          .map((reminder) => `${reminder.title} (${formatDate(reminder.date)})`)
          .join('; ')
      : 'No urgent reminders are waiting';
  const preparationSummary =
    linkedPreparation.length > 0
      ? ` Linked prep: ${linkedPreparation.join('; ')}.`
      : '';

  return {
    prompt,
    response: `Here is the family operations brief: tasks to handle: ${taskSummary}. Upcoming events: ${eventSummary}. Reminders: ${reminderSummary}.${preparationSummary} Suggested next step: assign owners for anything still pending and block 20 minutes today for preparation.`
  };
};
