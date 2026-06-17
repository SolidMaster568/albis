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
import type { Event } from '../../types/domain';
import type { EventFormValues } from '../../types/forms';

const eventTypes = ['School Event', 'Medical Appointment', 'Birthday', 'Activity'] as const;

const defaultValues: EventFormValues = {
  title: '',
  description: '',
  date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  type: 'Activity'
};

const buildDefaultValues = (initialDate?: Date | null, event?: Event | null): EventFormValues => {
  if (event) {
    return {
      title: event.title,
      description: event.description ?? '',
      date: format(new Date(event.date), "yyyy-MM-dd'T'HH:mm"),
      type: event.type
    };
  }

  return {
    ...defaultValues,
    date: format(initialDate ?? new Date(), "yyyy-MM-dd'T'HH:mm")
  };
};

export const EventDialog = ({
  open,
  initialDate,
  event,
  saving,
  onClose,
  onSubmit
}: {
  open: boolean;
  initialDate?: Date | null;
  event?: Event | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: EventFormValues) => void;
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EventFormValues>({
    defaultValues: buildDefaultValues(initialDate, event)
  });

  useEffect(() => {
    if (open) {
      reset(buildDefaultValues(initialDate, event));
    }
  }, [event, initialDate, open, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{event ? 'Edit Event' : 'Create Event'}</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="event-form"
          spacing={2.5}
          sx={{ mt: 1 }}
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
          <Controller
            name="date"
            control={control}
            rules={{ required: 'Date is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Date"
                type="datetime-local"
                error={Boolean(errors.date)}
                helperText={errors.date?.message}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            )}
          />
          <Controller
            name="type"
            control={control}
            rules={{ required: 'Type is required' }}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.type)}>
                <InputLabel>Type</InputLabel>
                <Select {...field} label="Type">
                  {eventTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.type?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" type="submit" form="event-form" disabled={saving}>
          {event ? 'Save event' : 'Create event'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
