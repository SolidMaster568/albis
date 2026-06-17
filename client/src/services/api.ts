import type {
  AuthResponse,
  DashboardSummary,
  Event,
  Family,
  Notification,
  Reminder,
  Task,
  User
} from '../types/domain';
import type {
  EventFormValues,
  ForgotPasswordFormValues,
  InviteFormValues,
  LoginFormValues,
  ProfileFormValues,
  RegisterFormValues,
  TaskFormValues
} from '../types/forms';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
const TOKEN_KEY = 'albis_token';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY)
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const headers = new Headers(options.headers);
  const token = tokenStorage.get();

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message ?? 'Request failed');
  }

  return payload as T;
};

export const api = {
  login: (body: LoginFormValues) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body
    }),
  register: (body: RegisterFormValues) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body
    }),
  forgotPassword: (body: ForgotPasswordFormValues) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body
    }),
  getProfile: () => request<{ user: User; family: Family | null }>('/auth/me'),
  updateProfile: (body: ProfileFormValues) =>
    request<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body
    }),
  getFamily: () => request<Family>('/families/current'),
  inviteMember: (body: InviteFormValues) =>
    request<{ message: string; family: Family }>('/families/invite', {
      method: 'POST',
      body
    }),
  updateMemberRole: (userId: string, role: InviteFormValues['role']) =>
    request<Family>(`/families/members/${userId}/role`, {
      method: 'PUT',
      body: { role }
    }),
  getTasks: () => request<Task[]>('/tasks'),
  createTask: (body: TaskFormValues) =>
    request<Task>('/tasks', {
      method: 'POST',
      body
    }),
  updateTask: (id: string, body: Partial<TaskFormValues>) =>
    request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body
    }),
  deleteTask: (id: string) =>
    request<void>(`/tasks/${id}`, {
      method: 'DELETE'
    }),
  getEvents: () => request<Event[]>('/events'),
  createEvent: (body: EventFormValues) =>
    request<Event>('/events', {
      method: 'POST',
      body
    }),
  updateEvent: (id: string, body: EventFormValues) =>
    request<Event>(`/events/${id}`, {
      method: 'PUT',
      body
    }),
  deleteEvent: (id: string) =>
    request<void>(`/events/${id}`, {
      method: 'DELETE'
    }),
  getReminders: () => request<Reminder[]>('/reminders'),
  getDashboardSummary: () => request<DashboardSummary>('/dashboard/summary'),
  chat: (prompt: string) =>
    request<{ prompt: string; response: string }>('/assistant/chat', {
      method: 'POST',
      body: { prompt }
    }),
  getNotifications: () => request<Notification[]>('/notifications'),
  markNotificationRead: (id: string) =>
    request<Notification>(`/notifications/${id}/read`, {
      method: 'PUT'
    })
};
