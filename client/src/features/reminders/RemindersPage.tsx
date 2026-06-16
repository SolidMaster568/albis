import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography
} from '@mui/material';
import { differenceInCalendarDays } from 'date-fns';
import { useEffect } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { ErrorAlert } from '../../components/ErrorAlert';
import { LoadingState } from '../../components/LoadingState';
import { PageHeader } from '../../components/PageHeader';
import { formatFullDate } from '../../components/date';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchReminders } from './remindersSlice';

const reminderLabel = (date: string) => {
  const days = differenceInCalendarDays(new Date(date), new Date());

  if (days === 0) {
    return 'Today';
  }

  if (days === 1) {
    return 'Tomorrow';
  }

  return `${days} days`;
};

export const RemindersPage = () => {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.reminders);

  useEffect(() => {
    dispatch(fetchReminders());
  }, [dispatch]);

  if (status === 'loading' && items.length === 0) {
    return <LoadingState label="Loading reminders" />;
  }

  return (
    <Box>
      <PageHeader title="Reminder Center" />
      <Stack spacing={2}>
        <ErrorAlert message={error} />
        {items.length === 0 ? (
          <EmptyState title="No upcoming reminders" />
        ) : (
          items.map((reminder) => (
            <Card key={reminder._id} variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <NotificationsActiveOutlinedIcon color="warning" />
                  <Box sx={{ flexGrow: 1 }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Typography variant="h6" fontWeight={900}>
                        {reminder.title}
                      </Typography>
                      <Chip label={reminderLabel(reminder.date)} color="warning" size="small" />
                    </Stack>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                      {reminder.message}
                    </Typography>
                    <Typography variant="body2" fontWeight={800} sx={{ mt: 2 }}>
                      {formatFullDate(reminder.date)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    </Box>
  );
};
