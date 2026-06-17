import AddIcon from '@mui/icons-material/Add';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import type { EventClickArg, EventContentArg, EventDropArg, EventInput } from '@fullcalendar/core';
import {
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { differenceInCalendarDays, format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { ErrorAlert } from '../../components/ErrorAlert';
import { LoadingState } from '../../components/LoadingState';
import { PageHeader } from '../../components/PageHeader';
import { PriorityChip, StatusChip } from '../../components/StatusChip';
import { WorkspacePanel } from '../../components/WorkspacePanel';
import { formatDateTime, formatFullDate } from '../../components/date';
import { fetchCurrentFamily } from '../family/familySlice';
import { TaskDialog } from '../tasks/TaskDialog';
import { createTask, deleteTask, fetchTasks, updateTask } from '../tasks/tasksSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import type { Event, EventType, Task, TaskPriority } from '../../types/domain';
import type { EventFormValues, TaskFormValues } from '../../types/forms';
import { createEvent, deleteEvent, fetchEvents, updateEvent } from './calendarSlice';
import { EventDialog } from './EventDialog';

type CalendarFilter = 'all' | 'events' | 'tasks';

type CalendarItem =
  | {
      id: string;
      kind: 'event';
      title: string;
      date: string;
      type: EventType;
      description?: string;
      raw: Event;
    }
  | {
      id: string;
      kind: 'task';
      title: string;
      date: string;
      priority: TaskPriority;
      description?: string;
      raw: Task;
    };

const eventTone: Record<
  EventType,
  {
    color: string;
    soft: string;
  }
> = {
  'School Event': { color: '#4F46E5', soft: '#EEF2FF' },
  'Medical Appointment': { color: '#0891B2', soft: '#ECFEFF' },
  Birthday: { color: '#7C3AED', soft: '#F3E8FF' },
  Activity: { color: '#16A34A', soft: '#ECFDF5' }
};

const taskTone: Record<TaskPriority, { color: string; soft: string }> = {
  High: { color: '#DC2626', soft: '#FEF2F2' },
  Medium: { color: '#F59E0B', soft: '#FFFBEB' },
  Low: { color: '#16A34A', soft: '#ECFDF5' }
};

const getEventTone = (type: EventType) => eventTone[type] ?? eventTone.Activity;
const getTaskTone = (priority: TaskPriority) => taskTone[priority] ?? taskTone.Medium;

const eventUrgency = (date: string) => {
  const days = differenceInCalendarDays(new Date(date), new Date());

  if (days <= 0) {
    return 'Today';
  }

  if (days === 1) {
    return 'Tomorrow';
  }

  return `${days} days`;
};

const parseCalendarId = (id: string) => {
  const [kind, itemId] = id.split(':') as ['event' | 'task', string];
  return { kind, itemId };
};

export const CalendarPage = ({ initialFilter = 'all' }: { initialFilter?: CalendarFilter }) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { events, status, saving, error } = useAppSelector((state) => state.calendar);
  const {
    items: tasks,
    status: taskStatus,
    saving: taskSaving,
    error: taskError
  } = useAppSelector((state) => state.tasks);
  const family = useAppSelector((state) => state.family.family ?? state.auth.family);
  const [filter, setFilter] = useState<CalendarFilter>(initialFilter);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [initialDate, setInitialDate] = useState<Date | null>(null);
  const [initialRelatedEventId, setInitialRelatedEventId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchEvents());
    dispatch(fetchTasks());

    if (!family) {
      dispatch(fetchCurrentFamily());
    }
  }, [dispatch, family]);

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  const openTasks = useMemo(
    () => tasks.filter((task) => task.status !== 'Completed'),
    [tasks]
  );
  const calendarItems = useMemo<CalendarItem[]>(() => {
    const eventItems: CalendarItem[] = events.map((event) => ({
      id: `event:${event._id}`,
      kind: 'event',
      title: event.title,
      date: event.date,
      type: event.type,
      description: event.description,
      raw: event
    }));
    const taskItems: CalendarItem[] = openTasks.map((task) => ({
      id: `task:${task._id}`,
      kind: 'task',
      title: task.title,
      date: task.dueDate,
      priority: task.priority,
      description: task.description,
      raw: task
    }));

    return [...eventItems, ...taskItems].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [events, openTasks]);
  const visibleItems = useMemo(
    () =>
      calendarItems.filter((item) => {
        if (filter === 'events') {
          return item.kind === 'event';
        }

        if (filter === 'tasks') {
          return item.kind === 'task';
        }

        return true;
      }),
    [calendarItems, filter]
  );
  const calendarEvents = useMemo<EventInput[]>(
    () =>
      visibleItems.map((item) => {
        if (item.kind === 'event') {
          const tone = getEventTone(item.type);
          const backgroundColor = alpha(tone.color, theme.palette.mode === 'light' ? 0.12 : 0.24);
          const borderColor = alpha(tone.color, theme.palette.mode === 'light' ? 0.16 : 0.26);

          return {
            id: item.id,
            title: item.title,
            start: item.date,
            classNames: ['albis-calendar-item', 'albis-calendar-item-event'],
            backgroundColor,
            borderColor,
            textColor: theme.palette.text.primary,
            extendedProps: {
              accentColor: tone.color,
              kind: 'event',
              type: item.type,
              description: item.description
            }
          };
        }

        const tone = getTaskTone(item.priority);
        const backgroundColor = alpha(tone.color, theme.palette.mode === 'light' ? 0.06 : 0.14);
        const borderColor = alpha(tone.color, theme.palette.mode === 'light' ? 0.1 : 0.2);

        return {
          id: item.id,
          title: item.title,
          start: item.date,
          classNames: ['albis-calendar-item', 'albis-calendar-item-task'],
          backgroundColor,
          borderColor,
          textColor: theme.palette.text.primary,
          extendedProps: {
            accentColor: tone.color,
            kind: 'task',
            priority: item.priority,
            status: item.raw.status,
            assignedTo: item.raw.assignedTo.name,
            description: item.description
          }
        };
      }),
    [theme.palette.mode, visibleItems]
  );
  const upcomingItems = useMemo(
    () =>
      visibleItems.filter(
        (item) => new Date(item.date).getTime() >= new Date().setHours(0, 0, 0, 0)
      ),
    [visibleItems]
  );
  const selectedItem = useMemo(
    () =>
      calendarItems.find((item) => item.id === selectedItemId) ??
      upcomingItems[0] ??
      visibleItems[0] ??
      null,
    [calendarItems, selectedItemId, upcomingItems, visibleItems]
  );
  const linkedTasks = useMemo(() => {
    if (!selectedItem || selectedItem.kind !== 'event') {
      return [];
    }

    return tasks
      .filter((task) => task.relatedEvent?._id === selectedItem.raw._id)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [selectedItem, tasks]);
  const eventMix = useMemo(
    () =>
      events.reduce<Record<EventType, number>>(
        (acc, event) => {
          acc[event.type] += 1;
          return acc;
        },
        {
          'School Event': 0,
          'Medical Appointment': 0,
          Birthday: 0,
          Activity: 0
        }
      ),
    [events]
  );
  const isEventsRoute = initialFilter === 'events';

  const closeEventDialog = () => {
    setEventDialogOpen(false);
    setInitialDate(null);
    setEditingEvent(null);
  };

  const closeTaskDialog = () => {
    setTaskDialogOpen(false);
    setInitialDate(null);
    setInitialRelatedEventId(null);
    setEditingTask(null);
  };

  const handleEventSubmit = (values: EventFormValues) => {
    if (editingEvent) {
      dispatch(updateEvent({ id: editingEvent._id, values }))
        .unwrap()
        .then((event) => {
          dispatch(fetchTasks());
          setSelectedItemId(`event:${event._id}`);
          closeEventDialog();
        });
      return;
    }

    dispatch(createEvent(values))
      .unwrap()
      .then((event) => {
        setSelectedItemId(`event:${event._id}`);
        closeEventDialog();
      });
  };

  const handleTaskSubmit = (values: TaskFormValues) => {
    if (editingTask) {
      dispatch(updateTask({ id: editingTask._id, values }))
        .unwrap()
        .then((task) => {
          setSelectedItemId(`task:${task._id}`);
          closeTaskDialog();
        });
      return;
    }

    dispatch(createTask(values))
      .unwrap()
      .then((task) => {
        setSelectedItemId(`task:${task._id}`);
        closeTaskDialog();
      });
  };

  const handleDateClick = (arg: DateClickArg) => {
    setInitialDate(arg.date);
    setInitialRelatedEventId(null);
    setEditingEvent(null);
    setEventDialogOpen(true);
  };

  const handleEventClick = (arg: EventClickArg) => {
    setSelectedItemId(arg.event.id);
  };

  const handleEventDrop = (arg: EventDropArg) => {
    const { kind, itemId } = parseCalendarId(arg.event.id);

    if (!arg.event.start) {
      arg.revert();
      return;
    }

    if (kind === 'event') {
      const event = events.find((item) => item._id === itemId);

      if (!event) {
        arg.revert();
        return;
      }

      dispatch(
        updateEvent({
          id: event._id,
          values: {
            title: event.title,
            description: event.description ?? '',
            date: arg.event.start.toISOString(),
            type: event.type
          }
        })
      )
        .unwrap()
        .then((updatedEvent) => setSelectedItemId(`event:${updatedEvent._id}`))
        .catch(() => arg.revert());
      return;
    }

    const task = openTasks.find((item) => item._id === itemId);

    if (!task) {
      arg.revert();
      return;
    }

    dispatch(updateTask({ id: task._id, values: { dueDate: arg.event.start.toISOString() } }))
      .unwrap()
      .then((updatedTask) => setSelectedItemId(`task:${updatedTask._id}`))
      .catch(() => arg.revert());
  };

  const handleEditSelectedItem = () => {
    if (!selectedItem) {
      return;
    }

    if (selectedItem.kind === 'event') {
      setEditingEvent(selectedItem.raw);
      setInitialDate(null);
      setEventDialogOpen(true);
      return;
    }

    setEditingTask(selectedItem.raw);
    setInitialDate(null);
    setInitialRelatedEventId(null);
    setTaskDialogOpen(true);
  };

  const handleCreateRelatedTask = () => {
    if (!selectedItem || selectedItem.kind !== 'event') {
      return;
    }

    setEditingTask(null);
    setInitialDate(new Date(selectedItem.raw.date));
    setInitialRelatedEventId(selectedItem.raw._id);
    setTaskDialogOpen(true);
  };

  const handleDeleteSelectedItem = () => {
    if (!selectedItem || !window.confirm(`Delete "${selectedItem.title}"?`)) {
      return;
    }

    if (selectedItem.kind === 'event') {
      dispatch(deleteEvent(selectedItem.raw._id))
        .unwrap()
        .then(() => {
          dispatch(fetchTasks());
          setSelectedItemId(null);
        });
      return;
    }

    dispatch(deleteTask(selectedItem.raw._id))
      .unwrap()
      .then(() => setSelectedItemId(null));
  };

  const renderEventContent = (arg: EventContentArg) => {
    const kind = arg.event.extendedProps.kind as 'event' | 'task';
    const isTask = kind === 'task';
    const label = isTask ? 'Task' : 'Event';
    const detail =
      kind === 'event'
        ? (arg.event.extendedProps.type as EventType)
        : `${arg.event.extendedProps.priority as TaskPriority} priority`;
    const accentColor =
      (arg.event.extendedProps.accentColor as string | undefined) ??
      (kind === 'event'
        ? getEventTone(arg.event.extendedProps.type as EventType).color
        : getTaskTone(arg.event.extendedProps.priority as TaskPriority).color);

    return (
      <Stack
        direction="row"
        spacing={0.8}
        alignItems="center"
        sx={{
          minWidth: 0,
          width: '100%',
          color: 'text.primary'
        }}
      >
        <Box
          sx={{
            width: 20,
            height: 20,
            borderRadius: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(accentColor, theme.palette.mode === 'light' ? 0.14 : 0.26),
            color: accentColor,
            flexShrink: 0
          }}
        >
          {isTask ? (
            <ChecklistOutlinedIcon sx={{ fontSize: 14 }} />
          ) : (
            <CalendarMonthOutlinedIcon sx={{ fontSize: 14 }} />
          )}
        </Box>
        <Typography
          component="span"
          sx={{
            minWidth: 0,
            flexGrow: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: 12,
            fontWeight: 800,
            lineHeight: 1.4
          }}
          title={detail}
        >
          {isTask ? 'Due: ' : ''}
          {arg.event.title}
        </Typography>
        <Typography
          component="span"
          sx={{
            bgcolor: alpha(accentColor, theme.palette.mode === 'light' ? 0.1 : 0.2),
            borderRadius: 0.75,
            color: accentColor,
            display: { xs: 'none', md: 'inline-flex' },
            flexShrink: 0,
            fontSize: 9,
            fontWeight: 900,
            lineHeight: 1,
            px: 0.5,
            py: 0.25,
            textTransform: 'uppercase'
          }}
        >
          {label}
        </Typography>
      </Stack>
    );
  };

  if ((status === 'loading' || taskStatus === 'loading') && events.length === 0 && tasks.length === 0) {
    return <LoadingState label="Loading calendar" />;
  }

  return (
    <Box>
      <PageHeader
        title={isEventsRoute ? 'Events' : 'Calendar'}
        eyebrow={isEventsRoute ? 'Family schedule' : 'Family rhythm'}
        subtitle={
          isEventsRoute
            ? 'Focus on school, medical, birthday and activity events across the family.'
            : 'Events and task due dates belong together in the planning view, while staying separate as data.'
        }
        action={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              variant="outlined"
              startIcon={<AssignmentTurnedInOutlinedIcon />}
              onClick={() => {
                setInitialDate(null);
                setInitialRelatedEventId(null);
                setEditingTask(null);
                setTaskDialogOpen(true);
              }}
            >
              Create task
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setInitialDate(null);
                setInitialRelatedEventId(null);
                setEditingEvent(null);
                setEventDialogOpen(true);
              }}
            >
              Create event
            </Button>
          </Stack>
        }
      />
      <Stack spacing={2}>
        <ErrorAlert message={error || taskError} />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1fr) 360px' },
            gap: 2,
            alignItems: 'start'
          }}
        >
          <WorkspacePanel
            title={isEventsRoute ? 'Event Calendar' : 'Planning Calendar'}
            subtitle={
              isEventsRoute
                ? 'Click a date to create an event. Switch filters when you need task due dates too.'
                : 'Click a date to create an event. Drag events or task due dates to reschedule.'
            }
            action={
              <ToggleButtonGroup
                value={filter}
                exclusive
                onChange={(_, next) => next && setFilter(next)}
                size="small"
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="events">
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <CalendarMonthOutlinedIcon sx={{ fontSize: 16 }} />
                    <span>Events</span>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="tasks">
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <ChecklistOutlinedIcon sx={{ fontSize: 16 }} />
                    <span>Tasks</span>
                  </Stack>
                </ToggleButton>
              </ToggleButtonGroup>
            }
          >
            <Box className={`albis-calendar albis-calendar-${theme.palette.mode}`}>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                initialView={isMobile ? 'listWeek' : 'dayGridMonth'}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: isMobile ? 'listWeek' : 'dayGridMonth,timeGridWeek,listWeek'
                }}
                buttonText={{
                  today: 'Today',
                  month: 'Month',
                  week: 'Week',
                  list: 'Agenda'
                }}
                events={calendarEvents}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                eventDrop={handleEventDrop}
                eventContent={renderEventContent}
                height="auto"
                dayMaxEvents={3}
                nowIndicator
                selectable
                editable
                eventStartEditable
                weekends
                firstDay={1}
                expandRows
              />
            </Box>
          </WorkspacePanel>

          <Stack spacing={2}>
            <WorkspacePanel
              title={selectedItem?.kind === 'task' ? 'Task Detail' : 'Event Detail'}
              subtitle="Selected calendar item."
            >
              {selectedItem ? (
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="h6" fontWeight={900} noWrap>
                        {selectedItem.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(selectedItem.date)}
                      </Typography>
                    </Box>
                    {selectedItem.kind === 'event' ? (
                      <Chip
                        label={selectedItem.type}
                        size="small"
                        sx={{
                          bgcolor: (activeTheme) =>
                            activeTheme.palette.mode === 'light'
                              ? getEventTone(selectedItem.type).soft
                              : alpha(getEventTone(selectedItem.type).color, 0.16),
                          color: getEventTone(selectedItem.type).color,
                          fontWeight: 900
                        }}
                      />
                    ) : (
                      <PriorityChip priority={selectedItem.priority} />
                    )}
                  </Stack>
                  <Stack spacing={1}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Button
                        variant="outlined"
                        startIcon={<EditOutlinedIcon />}
                        onClick={handleEditSelectedItem}
                      >
                        {selectedItem.kind === 'task' ? 'Edit task' : 'Edit event'}
                      </Button>
                      <Button
                        color="error"
                        variant="outlined"
                        startIcon={<DeleteOutlineIcon />}
                        onClick={handleDeleteSelectedItem}
                        disabled={saving || taskSaving}
                      >
                        Delete
                      </Button>
                    </Stack>
                    {selectedItem.kind === 'event' && (
                      <Button
                        variant="contained"
                        startIcon={<AssignmentTurnedInOutlinedIcon />}
                        onClick={handleCreateRelatedTask}
                        sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
                      >
                        Add related task
                      </Button>
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {selectedItem.description || 'No description added.'}
                  </Typography>
                  {selectedItem.kind === 'task' && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <StatusChip status={selectedItem.raw.status} />
                      <Chip label={`Assigned to ${selectedItem.raw.assignedTo.name}`} variant="outlined" />
                      {selectedItem.raw.relatedEvent && (
                        <Chip
                          icon={<EventAvailableOutlinedIcon />}
                          label={`Related to ${selectedItem.raw.relatedEvent.title}`}
                          variant="outlined"
                          onClick={() =>
                            setSelectedItemId(`event:${selectedItem.raw.relatedEvent?._id}`)
                          }
                          sx={{
                            maxWidth: '100%',
                            '& .MuiChip-label': {
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }
                          }}
                        />
                      )}
                    </Stack>
                  )}
                  {selectedItem.kind === 'event' && (
                    <Stack spacing={1}>
                      <Typography variant="caption" color="text.secondary" fontWeight={900}>
                        LINKED TASKS
                      </Typography>
                      {linkedTasks.length > 0 ? (
                        linkedTasks.map((task) => (
                          <Stack
                            key={task._id}
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            onClick={() => setSelectedItemId(`task:${task._id}`)}
                            sx={{
                              p: 1,
                              border: 1,
                              borderColor: 'divider',
                              borderRadius: 1,
                              cursor: 'pointer'
                            }}
                          >
                            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                              <Typography variant="body2" fontWeight={900} noWrap>
                                {task.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Due {formatDateTime(task.dueDate)}
                              </Typography>
                            </Box>
                            <StatusChip status={task.status} />
                          </Stack>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No related tasks yet.
                        </Typography>
                      )}
                    </Stack>
                  )}
                  <Divider />
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary" fontWeight={900}>
                      ALBIS PLANNING SIGNAL
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip icon={<AutoAwesomeOutlinedIcon />} label={eventUrgency(selectedItem.date)} />
                      <Chip
                        icon={<EventAvailableOutlinedIcon />}
                        label={formatFullDate(selectedItem.date)}
                        variant="outlined"
                      />
                    </Stack>
                  </Stack>
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Add an event or task to start shaping the family rhythm.
                </Typography>
              )}
            </WorkspacePanel>

            <WorkspacePanel title="Upcoming" subtitle="Next scheduled moments and due tasks.">
              <Stack spacing={1.5}>
                {upcomingItems.slice(0, 6).map((item) => {
                  const color =
                    item.kind === 'event'
                      ? getEventTone(item.type).color
                      : getTaskTone(item.priority).color;

                  return (
                    <Stack
                      key={item.id}
                      direction="row"
                      spacing={1.25}
                      alignItems="center"
                      onClick={() => setSelectedItemId(item.id)}
                      sx={{
                        p: 1.25,
                        border: 1,
                        borderColor: selectedItem?.id === item.id ? 'primary.main' : 'divider',
                        borderRadius: 1,
                        cursor: 'pointer',
                        bgcolor:
                          selectedItem?.id === item.id
                            ? alpha(theme.palette.primary.main, 0.08)
                            : 'transparent'
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 36,
                          borderRadius: 1,
                          bgcolor: color,
                          flexShrink: 0
                        }}
                      />
                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography variant="body2" fontWeight={900} noWrap>
                          {item.kind === 'task' ? 'Task: ' : ''}
                          {item.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(item.date), 'EEE, MMM d')}
                        </Typography>
                      </Box>
                      <Chip size="small" label={item.kind === 'event' ? 'Event' : 'Task'} variant="outlined" />
                    </Stack>
                  );
                })}
                {upcomingItems.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No upcoming calendar items.
                  </Typography>
                )}
              </Stack>
            </WorkspacePanel>

            <WorkspacePanel title="Calendar Mix" subtitle="What this planning view contains.">
              <Stack spacing={1.25}>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4F46E5' }} />
                    <Typography variant="body2" color="text.secondary">
                      Events
                    </Typography>
                  </Stack>
                  <Typography variant="body2" fontWeight={900}>
                    {events.length}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                    <Typography variant="body2" color="text.secondary">
                      Open task due dates
                    </Typography>
                  </Stack>
                  <Typography variant="body2" fontWeight={900}>
                    {openTasks.length}
                  </Typography>
                </Stack>
                <Divider />
                {(Object.entries(eventMix) as [EventType, number][]).map(([type, count]) => (
                  <Stack key={type} direction="row" justifyContent="space-between" spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: getEventTone(type).color
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {type}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={900}>
                      {count}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </WorkspacePanel>
          </Stack>
        </Box>
      </Stack>
      <EventDialog
        open={eventDialogOpen}
        initialDate={initialDate}
        event={editingEvent}
        saving={saving}
        onClose={closeEventDialog}
        onSubmit={handleEventSubmit}
      />
      <TaskDialog
        open={taskDialogOpen}
        task={editingTask}
        family={family}
        events={events}
        initialDueDate={initialDate}
        initialRelatedEventId={initialRelatedEventId}
        saving={taskSaving}
        onClose={closeTaskDialog}
        onSubmit={handleTaskSubmit}
      />
    </Box>
  );
};
