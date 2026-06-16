import { connectDatabase } from '../config/database.js';
import { Activity } from '../models/Activity.js';
import { Event } from '../models/Event.js';
import { Family } from '../models/Family.js';
import { Notification } from '../models/Notification.js';
import { Reminder } from '../models/Reminder.js';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';

const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const seed = async () => {
  await connectDatabase();

  await Promise.all([
    Activity.deleteMany({}),
    Event.deleteMany({}),
    Family.deleteMany({}),
    Notification.deleteMany({}),
    Reminder.deleteMany({}),
    Task.deleteMany({}),
    User.deleteMany({})
  ]);

  const [john, sarah, emma, lucas] = await User.create([
    {
      name: 'John',
      email: 'john@albis.local',
      password: 'password123',
      avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=John'
    },
    {
      name: 'Sarah',
      email: 'sarah@albis.local',
      password: 'password123',
      avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=Sarah'
    },
    {
      name: 'Emma',
      email: 'emma@albis.local',
      password: 'password123',
      avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=Emma'
    },
    {
      name: 'Lucas',
      email: 'lucas@albis.local',
      password: 'password123',
      avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=Lucas'
    }
  ]);

  const family = await Family.create({
    name: 'The Carter Family',
    owner: john._id,
    members: [
      { user: john._id, role: 'Parent' },
      { user: sarah._id, role: 'Partner' },
      { user: emma._id, role: 'Child' },
      { user: lucas._id, role: 'Child' }
    ]
  });

  const now = new Date();

  const tasks = await Task.create([
    {
      family: family._id,
      title: 'School trip preparation',
      description: 'Pack permission slip, lunch, water bottle and rain jacket.',
      priority: 'High',
      dueDate: addDays(now, 1),
      status: 'In Progress',
      assignedTo: sarah._id,
      createdBy: john._id
    },
    {
      family: family._id,
      title: 'Doctor appointment',
      description: 'Bring insurance card and Lucas vaccination record.',
      priority: 'High',
      dueDate: addDays(now, 3),
      status: 'Pending',
      assignedTo: john._id,
      createdBy: sarah._id
    },
    {
      family: family._id,
      title: 'Buy groceries',
      description: 'Milk, fruit, snacks, breakfast supplies and birthday candles.',
      priority: 'Medium',
      dueDate: now,
      status: 'Pending',
      assignedTo: john._id,
      createdBy: sarah._id
    },
    {
      family: family._id,
      title: 'Confirm birthday RSVPs',
      description: 'Message parents who have not responded yet.',
      priority: 'Low',
      dueDate: addDays(now, 5),
      status: 'Completed',
      assignedTo: sarah._id,
      createdBy: john._id
    }
  ]);

  const events = await Event.create([
    {
      family: family._id,
      title: 'Parent teacher meeting',
      description: 'Check in with Emma teacher about next term goals.',
      date: addDays(now, 2),
      type: 'School Event'
    },
    {
      family: family._id,
      title: 'Birthday party',
      description: 'Lucas party at the indoor climbing gym.',
      date: addDays(now, 6),
      type: 'Birthday'
    },
    {
      family: family._id,
      title: 'Dentist appointment',
      description: 'Family cleaning appointments.',
      date: addDays(now, 9),
      type: 'Medical Appointment'
    }
  ]);

  await Reminder.create([
    {
      family: family._id,
      title: 'School trip tomorrow',
      message: 'Emma needs her backpack packed before bedtime.',
      date: addDays(now, 1)
    },
    {
      family: family._id,
      title: 'Dentist appointment next week',
      message: 'Confirm appointment and update the shared calendar.',
      date: addDays(now, 7)
    },
    {
      family: family._id,
      title: 'Birthday in three days',
      message: 'Pick up gift wrap and candles.',
      date: addDays(now, 3)
    }
  ]);

  await Activity.create([
    {
      family: family._id,
      user: john._id,
      action: 'Created the weekly family plan',
      timestamp: addDays(now, -1)
    },
    {
      family: family._id,
      user: sarah._id,
      action: 'Assigned groceries to John',
      timestamp: now
    },
    {
      family: family._id,
      user: sarah._id,
      action: 'Added parent teacher meeting',
      timestamp: now
    }
  ]);

  await Notification.create([
    {
      family: family._id,
      user: john._id,
      title: 'Task assignment',
      message: tasks[2].title,
      type: 'Task Assignment'
    },
    {
      family: family._id,
      user: john._id,
      title: 'Event reminder',
      message: events[0].title,
      type: 'Event Reminder'
    },
    {
      family: family._id,
      user: sarah._id,
      title: 'Activity update',
      message: 'John created the weekly family plan',
      type: 'Activity Update'
    }
  ]);

  console.log('Seeded ALBIS demo family');
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
