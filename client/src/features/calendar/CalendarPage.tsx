import AddIcon from '@mui/icons-material/Add';
import CalendarViewMonthOutlinedIcon from '@mui/icons-material/CalendarViewMonthOutlined';
import ViewWeekOutlinedIcon from '@mui/icons-material/ViewWeekOutlined';
import {
  Box,
  Card,
  Chip,
  IconButton,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from '@mui/material';
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek
} from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { ErrorAlert } from '../../components/ErrorAlert';
import { LoadingState } from '../../components/LoadingState';
import { PageHeader } from '../../components/PageHeader';
import { formatDateTime } from '../../components/date';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import type { EventFormValues } from '../../types/forms';
import { createEvent, fetchEvents } from './calendarSlice';
import { EventDialog } from './EventDialog';

type CalendarMode = 'month' | 'week';

export const CalendarPage = () => {
  const dispatch = useAppDispatch();
  const { events, status, saving, error } = useAppSelector((state) => state.calendar);
  const [mode, setMode] = useState<CalendarMode>('month');
  const [dialogOpen, setDialogOpen] = useState(false);
  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(now));
    const end = endOfWeek(endOfMonth(now));
    return eachDayOfInterval({ start, end });
  }, [now]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(now);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [now]);

  const eventsForDay = (day: Date) =>
    events.filter((event) => isSameDay(new Date(event.date), day));

  const handleSubmit = (values: EventFormValues) => {
    dispatch(createEvent(values)).then(() => setDialogOpen(false));
  };

  if (status === 'loading' && events.length === 0) {
    return <LoadingState label="Loading calendar" />;
  }

  return (
    <Box>
      <PageHeader
        title="Calendar"
        action={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={(_, next) => next && setMode(next)}
              size="small"
            >
              <ToggleButton value="month" aria-label="Monthly view">
                <CalendarViewMonthOutlinedIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="week" aria-label="Weekly view">
                <ViewWeekOutlinedIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
            <Tooltip title="Create event">
              <IconButton
                color="primary"
                onClick={() => setDialogOpen(true)}
                sx={{ border: 1, borderColor: 'divider', width: 40, height: 40 }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        }
      />
      <Stack spacing={2}>
        <ErrorAlert message={error} />
        <Typography variant="h6" fontWeight={900}>
          {format(now, 'MMMM yyyy')}
        </Typography>
        {mode === 'month' ? (
          <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))',
                overflowX: 'auto'
              }}
            >
              {monthDays.map((day) => {
                const dayEvents = eventsForDay(day);
                return (
                  <Box
                    key={day.toISOString()}
                    sx={{
                      minHeight: 132,
                      p: 1.25,
                      borderRight: 1,
                      borderBottom: 1,
                      borderColor: 'divider',
                      bgcolor: isSameMonth(day, now) ? 'background.paper' : 'action.hover'
                    }}
                  >
                    <Typography
                      variant="caption"
                      color={isSameMonth(day, now) ? 'text.primary' : 'text.secondary'}
                      fontWeight={800}
                    >
                      {format(day, 'd')}
                    </Typography>
                    <Stack spacing={0.75} sx={{ mt: 1 }}>
                      {dayEvents.slice(0, 3).map((event) => (
                        <Chip
                          key={event._id}
                          label={event.title}
                          size="small"
                          color={event.type === 'Medical Appointment' ? 'success' : 'primary'}
                          variant="outlined"
                          sx={{ justifyContent: 'flex-start', maxWidth: '100%' }}
                        />
                      ))}
                    </Stack>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'repeat(7, minmax(0, 1fr))' },
              gap: 1.5
            }}
          >
            {weekDays.map((day) => {
              const dayEvents = eventsForDay(day);
              return (
                <Card key={day.toISOString()} variant="outlined" sx={{ minHeight: 220 }}>
                  <Stack spacing={1.5} sx={{ p: 2 }}>
                    <Typography fontWeight={900}>{format(day, 'EEE d')}</Typography>
                    {dayEvents.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Open
                      </Typography>
                    ) : (
                      dayEvents.map((event) => (
                        <Box key={event._id}>
                          <Typography fontWeight={800}>{event.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDateTime(event.date)}
                          </Typography>
                          <Chip size="small" label={event.type} variant="outlined" sx={{ mt: 1 }} />
                        </Box>
                      ))
                    )}
                  </Stack>
                </Card>
              );
            })}
          </Box>
        )}
        {events.length === 0 && <EmptyState title="No events scheduled" />}
      </Stack>
      <EventDialog
        open={dialogOpen}
        saving={saving}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
    </Box>
  );
};
