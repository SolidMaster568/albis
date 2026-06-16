import type { EventType, FamilyRole, TaskPriority, TaskStatus } from './domain';

export type LoginFormValues = {
  email: string;
  password: string;
};

export type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  familyName: string;
};

export type ForgotPasswordFormValues = {
  email: string;
};

export type ProfileFormValues = {
  name: string;
  avatar: string;
};

export type TaskFormValues = {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  assignedTo: string;
  status: TaskStatus;
};

export type EventFormValues = {
  title: string;
  description: string;
  date: string;
  type: EventType;
};

export type InviteFormValues = {
  name: string;
  email: string;
  role: FamilyRole;
};
