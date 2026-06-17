import AddIcon from '@mui/icons-material/Add';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Chip,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { differenceInCalendarDays } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { ErrorAlert } from '../../components/ErrorAlert';
import { LoadingState } from '../../components/LoadingState';
import { PageHeader } from '../../components/PageHeader';
import { formatDateTime } from '../../components/date';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import type { Event, EventType } from '../../types/domain';
import type { EventFormValues } from '../../types/forms';
import { createEvent, deleteEvent, fetchEvents, updateEvent } from './calendarSlice';
import { EventDialog } from './EventDialog';

type EventFilter = 'All' | EventType;

const filters: EventFilter[] = ['All', 'School Event', 'Medical Appointment', 'Birthday', 'Activity'];

const eventTone: Record<EventType, string> = {
  'School Event': '#4F46E5',
  'Medical Appointment': '#0891B2',
  Birthday: '#7C3AED',
  Activity: '#16A34A'
};

const getEventTiming = (date: string) => {
  const days = differenceInCalendarDays(new Date(date), new Date());

  if (days < 0) {
    return 'Past event';
  }

  if (days === 0) {
    return 'Today';
  }

  if (days === 1) {
    return 'Tomorrow';
  }

  return `${days} days away`;
};

export const EventsPage = () => {
  const dispatch = useAppDispatch();
  const { events, status, saving, error } = useAppSelector((state) => state.calendar);
  const [filter, setFilter] = useState<EventFilter>('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const filteredEvents = useMemo(() => {
    const visible = filter === 'All' ? events : events.filter((event) => event.type === filter);
    return [...visible].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, filter]);

  const handleClose = () => {
    setDialogOpen(false);
    setEditingEvent(null);
  };

  const handleSubmit = (values: EventFormValues) => {
    if (editingEvent) {
      dispatch(updateEvent({ id: editingEvent._id, values })).then(handleClose);
      return;
    }

    dispatch(createEvent(values)).then(handleClose);
  };

  const handleDelete = (event: Event) => {
    if (window.confirm(`Delete "${event.title}"? Related tasks will stay, but lose this event link.`)) {
      dispatch(deleteEvent(event._id));
    }
  };

  if (status === 'loading' && events.length === 0) {
    return <LoadingState label="Loading events" />;
  }

  return (
    <Box>
      <PageHeader
        title="Events"
        eyebrow="Schedule"
        subtitle="Manage school, medical, birthday and activity events before they become last-minute logistics."
        action={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <ToggleButtonGroup
              value={filter}
              exclusive
              onChange={(_, next) => next && setFilter(next)}
              size="small"
              sx={{ overflowX: 'auto', maxWidth: '100%' }}
            >
              {filters.map((item) => (
                <ToggleButton key={item} value={item}>
                  {item}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <IconButton
              color="primary"
              onClick={() => {
                setEditingEvent(null);
                setDialogOpen(true);
              }}
              sx={{
                border: 1,
                borderColor: 'divider',
                width: 40,
                height: 40,
                alignSelf: { xs: 'flex-end', sm: 'center' }
              }}
            >
              <AddIcon />
            </IconButton>
          </Stack>
        }
      />
      <Stack spacing={2}>
        <ErrorAlert message={error} />
        {filteredEvents.length === 0 ? (
          <EmptyState title="No events found" />
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, minmax(0, 1fr))',
                xl: 'repeat(3, minmax(0, 1fr))'
              },
              gap: 2
            }}
          >
            {filteredEvents.map((event) => {
              const tone = eventTone[event.type];

              return (
                <Card
                  key={event._id}
                  variant="outlined"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'border-color 160ms ease, transform 160ms ease',
                    '&:hover': {
                      borderColor: tone,
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" spacing={2}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="h6" fontWeight={900} noWrap>
                            {event.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Family event
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: (theme) => alpha(tone, theme.palette.mode === 'light' ? 0.12 : 0.22),
                            color: tone,
                            flexShrink: 0
                          }}
                        >
                          <EventAvailableOutlinedIcon />
                        </Box>
                      </Stack>
                      <Typography color="text.secondary" variant="body2">
                        {event.description || 'No description'}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                          label={event.type}
                          sx={{
                            bgcolor: (theme) => alpha(tone, theme.palette.mode === 'light' ? 0.1 : 0.2),
                            color: tone
                          }}
                        />
                        <Chip icon={<CalendarMonthOutlinedIcon />} label={getEventTiming(event.date)} variant="outlined" />
                      </Stack>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Date
                        </Typography>
                        <Typography fontWeight={800}>{formatDateTime(event.date)}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                  <CardActions
                    sx={{
                      justifyContent: 'flex-end',
                      borderTop: 1,
                      borderColor: 'divider',
                      px: 2,
                      py: 1
                    }}
                  >
                    <Tooltip title="Edit event">
                      <IconButton
                        onClick={() => {
                          setEditingEvent(event);
                          setDialogOpen(true);
                        }}
                      >
                        <EditOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete event">
                      <IconButton color="error" onClick={() => handleDelete(event)}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              );
            })}
          </Box>
        )}
      </Stack>
      <EventDialog
        open={dialogOpen}
        event={editingEvent}
        saving={saving}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </Box>
  );
};
