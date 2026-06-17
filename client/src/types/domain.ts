export type FamilyRole = 'Parent' | 'Partner' | 'Child';
export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type EventType = 'School Event' | 'Medical Appointment' | 'Birthday' | 'Activity';
export type NotificationType = 'Task Assignment' | 'Event Reminder' | 'Activity Update';

export type User = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
};

export type FamilyMember = {
  user: User;
  role: FamilyRole;
  joinedAt: string;
};

export type Family = {
  _id: string;
  name: string;
  owner: string;
  members: FamilyMember[];
};

export type Task = {
  _id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
  assignedTo: User;
  relatedEvent?: Pick<Event, '_id' | 'title' | 'date' | 'type'> | null;
  createdBy: string;
};

export type Event = {
  _id: string;
  title: string;
  description?: string;
  date: string;
  type: EventType;
};

export type Reminder = {
  _id: string;
  title: string;
  message: string;
  date: string;
  completed: boolean;
};

export type Activity = {
  _id: string;
  action: string;
  user: User;
  timestamp: string;
};

export type Notification = {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
};

export type ChartDatum = {
  name: string;
  value: number;
};

export type DashboardSummary = {
  todayTasks: Task[];
  upcomingEvents: Event[];
  pendingReminders: Reminder[];
  activityFeed: Activity[];
  charts: {
    taskCompletion: ChartDatum[];
    upcomingEvents: ChartDatum[];
  };
};

export type AuthResponse = {
  token: string;
  user: User;
  family: Family | null;
};

export type ApiErrorResponse = {
  message: string;
  statusCode?: number;
};

export type AssistantMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};
