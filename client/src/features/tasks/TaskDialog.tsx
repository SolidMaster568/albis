import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField
} from '@mui/material';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { Family, Task } from '../../types/domain';
import type { TaskFormValues } from '../../types/forms';

const priorities = ['Low', 'Medium', 'High'] as const;
const statuses = ['Pending', 'In Progress', 'Completed'] as const;

const defaultValues: TaskFormValues = {
  title: '',
  description: '',
  priority: 'Medium',
  dueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  assignedTo: '',
  status: 'Pending'
};

const toFormValues = (task: Task | null, family: Family | null): TaskFormValues => {
  if (!task) {
    return {
      ...defaultValues,
      assignedTo: family?.members[0]?.user._id ?? ''
    };
  }

  return {
    title: task.title,
    description: task.description ?? '',
    priority: task.priority,
    dueDate: format(new Date(task.dueDate), "yyyy-MM-dd'T'HH:mm"),
    assignedTo: task.assignedTo._id,
    status: task.status
  };
};

export const TaskDialog = ({
  open,
  task,
  family,
  saving,
  onClose,
  onSubmit
}: {
  open: boolean;
  task: Task | null;
  family: Family | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TaskFormValues>({
    defaultValues: toFormValues(task, family)
  });

  useEffect(() => {
    reset(toFormValues(task, family));
  }, [family, reset, task]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          spacing={2.5}
          sx={{ mt: 1 }}
          id="task-form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Controller
            name="title"
            control={control}
            rules={{ required: 'Title is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Title"
                error={Boolean(errors.title)}
                helperText={errors.title?.message}
                fullWidth
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Description" multiline minRows={3} fullWidth />
            )}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select {...field} label="Priority">
                    {priorities.map((priority) => (
                      <MenuItem key={priority} value={priority}>
                        {priority}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select {...field} label="Status">
                    {statuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Stack>
          <Controller
            name="dueDate"
            control={control}
            rules={{ required: 'Due date is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Due date"
                type="datetime-local"
                error={Boolean(errors.dueDate)}
                helperText={errors.dueDate?.message}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            )}
          />
          <Controller
            name="assignedTo"
            control={control}
            rules={{ required: 'Assigned member is required' }}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.assignedTo)}>
                <InputLabel>Assigned member</InputLabel>
                <Select {...field} label="Assigned member">
                  {family?.members.map((member) => (
                    <MenuItem key={member.user._id} value={member.user._id}>
                      {member.user.name} · {member.role}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.assignedTo?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={saving}
          type="submit"
          form="task-form"
        >
          {task ? 'Save task' : 'Create task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
