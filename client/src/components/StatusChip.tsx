import { Chip } from '@mui/material';
import type { TaskPriority, TaskStatus } from '../types/domain';

export const statusColor = (status: TaskStatus) => {
  if (status === 'Completed') {
    return 'success';
  }

  if (status === 'In Progress') {
    return 'primary';
  }

  return 'default';
};

export const priorityColor = (priority: TaskPriority) => {
  if (priority === 'High') {
    return 'error';
  }

  if (priority === 'Medium') {
    return 'warning';
  }

  return 'success';
};

export const StatusChip = ({ status }: { status: TaskStatus }) => (
  <Chip size="small" label={status} color={statusColor(status)} />
);

export const PriorityChip = ({ priority }: { priority: TaskPriority }) => (
  <Chip size="small" label={priority} color={priorityColor(priority)} variant="outlined" />
);
