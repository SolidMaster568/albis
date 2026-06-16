import { configureStore } from '@reduxjs/toolkit';
import assistantReducer from '../features/assistant/assistantSlice';
import authReducer from '../features/auth/authSlice';
import calendarReducer from '../features/calendar/calendarSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import familyReducer from '../features/family/familySlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import remindersReducer from '../features/reminders/remindersSlice';
import tasksReducer from '../features/tasks/tasksSlice';

export const store = configureStore({
  reducer: {
    assistant: assistantReducer,
    auth: authReducer,
    calendar: calendarReducer,
    dashboard: dashboardReducer,
    family: familyReducer,
    notifications: notificationsReducer,
    reminders: remindersReducer,
    tasks: tasksReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
