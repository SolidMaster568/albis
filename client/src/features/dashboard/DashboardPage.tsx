import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography
} from '@mui/material';
import { useEffect } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { ErrorAlert } from '../../components/ErrorAlert';
import { LoadingState } from '../../components/LoadingState';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { PriorityChip, StatusChip } from '../../components/StatusChip';
import { formatCalendarDay, formatDateTime, formatShortDate } from '../../components/date';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchDashboardSummary } from './dashboardSlice';

const chartColors = ['#4F46E5', '#F59E0B', '#16A34A', '#DC2626'];

export const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { summary, status, error } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardSummary());
  }, [dispatch]);

  if (status === 'loading' && !summary) {
    return <LoadingState label="Loading dashboard" />;
  }

  return (
    <Box>
      <PageHeader title="Dashboard" />
      <ErrorAlert message={error} />
      {summary && (
        <Stack spacing={3}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))'
              },
              gap: 2
            }}
          >
            <StatCard
              label="Today's tasks"
              value={summary.todayTasks.length}
              icon={<AssignmentTurnedInOutlinedIcon color="primary" />}
            />
            <StatCard
              label="Upcoming events"
              value={summary.upcomingEvents.length}
              icon={<CalendarMonthOutlinedIcon color="secondary" />}
            />
            <StatCard
              label="Pending reminders"
              value={summary.pendingReminders.length}
              icon={<NotificationsActiveOutlinedIcon color="warning" />}
            />
            <StatCard
              label="Activity updates"
              value={summary.activityFeed.length}
              icon={<TimelineOutlinedIcon color="success" />}
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr' },
              gap: 2
            }}
          >
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>
                  Today's Tasks
                </Typography>
                <List disablePadding>
                  {summary.todayTasks.map((task, index) => (
                    <Box key={task._id}>
                      <ListItem
                        disableGutters
                        secondaryAction={
                          <Stack direction="row" spacing={1}>
                            <PriorityChip priority={task.priority} />
                            <StatusChip status={task.status} />
                          </Stack>
                        }
                      >
                        <ListItemText
                          primary={task.title}
                          secondary={`${task.assignedTo.name} · ${formatCalendarDay(task.dueDate)}`}
                          primaryTypographyProps={{ fontWeight: 800 }}
                        />
                      </ListItem>
                      {index < summary.todayTasks.length - 1 && <Divider />}
                    </Box>
                  ))}
                  {summary.todayTasks.length === 0 && (
                    <Typography color="text.secondary" variant="body2">
                      Nothing due today
                    </Typography>
                  )}
                </List>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>
                  Pending Reminders
                </Typography>
                <Stack spacing={1.5}>
                  {summary.pendingReminders.map((reminder) => (
                    <Box key={reminder._id}>
                      <Typography fontWeight={800}>{reminder.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {reminder.message}
                      </Typography>
                      <Chip
                        size="small"
                        label={formatShortDate(reminder.date)}
                        sx={{ mt: 1 }}
                        variant="outlined"
                      />
                    </Box>
                  ))}
                  {summary.pendingReminders.length === 0 && (
                    <Typography color="text.secondary" variant="body2">
                      No pending reminders
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
              gap: 2
            }}
          >
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>
                  Task Completion
                </Typography>
                <Box sx={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={summary.charts.taskCompletion}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={90}
                        label
                      >
                        {summary.charts.taskCompletion.map((entry, index) => (
                          <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>
                  Upcoming Events
                </Typography>
                <Box sx={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary.charts.upcomingEvents}>
                      <XAxis dataKey="name" tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
              gap: 2
            }}
          >
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>
                  Upcoming Events
                </Typography>
                <Stack spacing={1.5}>
                  {summary.upcomingEvents.map((event) => (
                    <Stack
                      key={event._id}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={2}
                    >
                      <Box>
                        <Typography fontWeight={800}>{event.title}</Typography>
                        <Typography color="text.secondary" variant="body2">
                          {formatDateTime(event.date)}
                        </Typography>
                      </Box>
                      <Chip size="small" label={event.type} variant="outlined" />
                    </Stack>
                  ))}
                  {summary.upcomingEvents.length === 0 && (
                    <Typography color="text.secondary" variant="body2">
                      No upcoming events
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>
                  Family Activity
                </Typography>
                <List disablePadding>
                  {summary.activityFeed.map((activity) => (
                    <ListItem key={activity._id} disableGutters>
                      <ListItemAvatar>
                        <Chip label={activity.user.name.slice(0, 1)} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.action}
                        secondary={formatDateTime(activity.timestamp)}
                        primaryTypographyProps={{ fontWeight: 800 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      )}
    </Box>
  );
};
