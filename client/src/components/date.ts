import { format, isToday } from 'date-fns';

export const formatShortDate = (date: string | Date) => format(new Date(date), 'MMM d');
export const formatFullDate = (date: string | Date) => format(new Date(date), 'MMM d, yyyy');
export const formatDateTime = (date: string | Date) => format(new Date(date), 'MMM d, h:mm a');
export const formatCalendarDay = (date: string | Date) =>
  isToday(new Date(date)) ? 'Today' : format(new Date(date), 'EEE, MMM d');
