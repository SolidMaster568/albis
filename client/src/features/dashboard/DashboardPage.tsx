import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import BalanceOutlinedIcon from '@mui/icons-material/BalanceOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import {
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { differenceInCalendarDays } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorAlert } from '../../components/ErrorAlert';
import { InsightCard } from '../../components/InsightCard';
import { LoadBalanceBar, type LoadBalanceEntry } from '../../components/LoadBalanceBar';
import { LoadingState } from '../../components/LoadingState';
import { PageHeader } from '../../components/PageHeader';
import { PrepPackCard, type PrepPack } from '../../components/PrepPackCard';
import { StatCard } from '../../components/StatCard';
import { PriorityChip, StatusChip } from '../../components/StatusChip';
import { WorkspacePanel } from '../../components/WorkspacePanel';
import { formatCalendarDay, formatDateTime, formatShortDate } from '../../components/date';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import type { Event, EventType } from '../../types/domain';
import { fetchDashboardSummary } from './dashboardSlice';

const chartColors = ['#4F46E5', '#0891B2', '#16A34A', '#F59E0B'];

const prepItemsByType: Record<EventType, string[]> = {
  'School Event': ['Confirm schedule', 'Pack forms', 'Prep transport'],
  'Medical Appointment': ['Confirm time', 'Bring documents', 'List questions'],
  Birthday: ['Confirm guests', 'Buy supplies', 'Plan pickup'],
  Activity: ['Check location', 'Pack gear', 'Confirm owner']
};

const buildPrepPack = (event: Event): PrepPack => {
  const daysAway = differenceInCalendarDays(new Date(event.date), new Date());
  const progress = Math.max(25, Math.min(85, 85 - Math.max(0, daysAway) * 8));

  return {
    id: event._id,
    title: event.title,
    type: event.type,
    dueLabel: daysAway <= 0 ? 'Today' : `${daysAway} days away`,
    progress,
    items: prepItemsByType[event.type]
  };
};

const ChartLegend = ({
  items
}: {
  items: {
    label: string;
    value: number;
    color: string;
  }[];
}) => (
  <Stack spacing={1.25}>
    {items.map((item) => (
      <Stack key={item.label} direction="row" justifyContent="space-between" spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              bgcolor: item.color,
              flexShrink: 0
            }}
          />
          <Typography variant="body2" color="text.secondary" noWrap>
            {item.label}
          </Typography>
        </Stack>
        <Typography variant="body2" fontWeight={900}>
          {item.value}
        </Typography>
      </Stack>
    ))}
  </Stack>
);

export const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { summary, status, error } = useAppSelector((state) => state.dashboard);
  const family = useAppSelector((state) => state.family.family ?? state.auth.family);
  const [quickCapture, setQuickCapture] = useState('');

  useEffect(() => {
    dispatch(fetchDashboardSummary());
  }, [dispatch]);

  const dashboardModel = useMemo(() => {
    if (!summary) {
      return null;
    }

    const completedTasks =
      summary.charts.taskCompletion.find((item) => item.name === 'Completed')?.value ?? 0;
    const openTasks = summary.charts.taskCompletion
      .filter((item) => item.name !== 'Completed')
      .reduce((total, item) => total + item.value, 0);
    const highPriorityToday = summary.todayTasks.filter((task) => task.priority === 'High').length;
    const prepPacks = summary.upcomingEvents.slice(0, 3).map(buildPrepPack);
    const taskCompletionChart = summary.charts.taskCompletion.map((item, index) => ({
      id: item.name,
      label: item.name,
      value: item.value,
      color: chartColors[index % chartColors.length]
    }));
    const eventMixChart = summary.charts.upcomingEvents.map((item, index) => ({
      label: item.name,
      value: item.value,
      color: chartColors[(index + 1) % chartColors.length]
    }));
    const loadEntries: LoadBalanceEntry[] =
      family?.members.map((member) => {
        const todayTasks = summary.todayTasks.filter(
          (task) => task.assignedTo._id === member.user._id
        ).length;

        return {
          id: member.user._id,
          name: member.user.name,
          role: member.role,
          avatar: member.user.avatar,
          value: todayTasks,
          helper: `${todayTasks} tasks today`
        };
      }) ?? [];

    const brief =
      summary.todayTasks.length === 0 && summary.pendingReminders.length === 0
        ? 'Today is light. Use the open space to prepare one thing for the week ahead.'
        : `${summary.todayTasks.length} tasks, ${summary.pendingReminders.length} reminders and ${summary.upcomingEvents.length} upcoming events need coordination.`;

    return {
      completedTasks,
      openTasks,
      highPriorityToday,
      prepPacks,
      taskCompletionChart,
      eventMixChart,
      loadEntries,
      brief
    };
  }, [family?.members, summary]);

  if (status === 'loading' && !summary) {
    return <LoadingState label="Loading dashboard" />;
  }

  return (
    <Box>
      <PageHeader
        eyebrow="Family Command Center"
        title="Less Mental Load. More Family Life."
        subtitle="ALBIS turns family logistics into a calm, shared operating rhythm."
      />
      <ErrorAlert message={error} />
      {summary && dashboardModel && (
        <Stack spacing={3}>
          <Box
            sx={{
              p: { xs: 2.25, md: 3 },
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'background.paper',
              background:
                theme.palette.mode === 'light'
                  ? 'linear-gradient(135deg, #FFFFFF 0%, #EEF2FF 58%, #ECFDF5 100%)'
                  : 'linear-gradient(135deg, #111827 0%, #18213A 58%, #10261F 100%)'
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1.25fr 0.75fr' },
                gap: { xs: 2.5, lg: 4 },
                alignItems: 'center'
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label={family?.name ?? 'Family workspace'} color="primary" />
                  <Chip label={formatCalendarDay(new Date())} variant="outlined" />
                </Stack>
                <Box>
                  <Typography variant="h5" fontWeight={900}>
                    Today's family operations brief
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mt: 1, maxWidth: 760, lineHeight: 1.7 }}
                  >
                    {dashboardModel.brief}
                  </Typography>
                </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                  <Button
                    variant="contained"
                    startIcon={<AutoAwesomeOutlinedIcon />}
                    onClick={() => navigate('/assistant')}
                  >
                    Ask ALBIS
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CalendarMonthOutlinedIcon />}
                    onClick={() => navigate('/calendar')}
                  >
                    Plan week
                  </Button>
                </Stack>
              </Stack>
              <Box
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: (activeTheme) => alpha(activeTheme.palette.primary.main, 0.18),
                  borderRadius: 1,
                  bgcolor: (activeTheme) =>
                    alpha(activeTheme.palette.background.paper, activeTheme.palette.mode === 'light' ? 0.72 : 0.54)
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={900}>
                  QUICK CAPTURE
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <TextField
                    value={quickCapture}
                    onChange={(event) => setQuickCapture(event.target.value)}
                    placeholder="Drop the loose thought here"
                    size="small"
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    endIcon={<SendOutlinedIcon />}
                    onClick={() => navigate('/assistant')}
                  >
                    Send
                  </Button>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Capture now, structure with the assistant next.
                </Typography>
              </Box>
            </Box>
          </Box>

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
              label="Open work"
              value={dashboardModel.openTasks}
              detail={`${dashboardModel.completedTasks} completed`}
              icon={<ChecklistOutlinedIcon />}
              tone="primary"
            />
            <StatCard
              label="Today's tasks"
              value={summary.todayTasks.length}
              detail={`${dashboardModel.highPriorityToday} high priority`}
              icon={<EventAvailableOutlinedIcon />}
              tone="info"
            />
            <StatCard
              label="Upcoming events"
              value={summary.upcomingEvents.length}
              detail="Next two weeks"
              icon={<CalendarMonthOutlinedIcon />}
              tone="secondary"
            />
            <StatCard
              label="Reminders"
              value={summary.pendingReminders.length}
              detail="Needs attention"
              icon={<NotificationsActiveOutlinedIcon />}
              tone="warning"
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', xl: '1.3fr 0.7fr' },
              gap: 2
            }}
          >
            <WorkspacePanel
              title="Focus Radar"
              subtitle="What ALBIS thinks deserves attention first."
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                  gap: 1.5
                }}
              >
                <InsightCard
                  label="Today"
                  title={
                    summary.todayTasks.length > 0
                      ? `${summary.todayTasks.length} tasks due today`
                      : 'Today is clear'
                  }
                  body={
                    dashboardModel.highPriorityToday > 0
                      ? `${dashboardModel.highPriorityToday} high-priority item should get an owner check.`
                      : 'No high-priority task pressure detected.'
                  }
                  icon={<ChecklistOutlinedIcon fontSize="small" />}
                  tone="primary"
                />
                <InsightCard
                  label="Prepare"
                  title={
                    dashboardModel.prepPacks.length > 0
                      ? `${dashboardModel.prepPacks.length} prep packs suggested`
                      : 'No prep packs needed'
                  }
                  body="Upcoming events are translated into simple preparation checklists."
                  icon={<AutoAwesomeOutlinedIcon fontSize="small" />}
                  tone="success"
                />
                <InsightCard
                  label="Balance"
                  title="Mental load visibility"
                  body="Today's assignments are shown by person so hidden work is easier to rebalance."
                  icon={<BalanceOutlinedIcon fontSize="small" />}
                  tone="info"
                />
              </Box>
            </WorkspacePanel>

            <WorkspacePanel title="Load Balance" subtitle="Today's visible responsibility split.">
              {dashboardModel.loadEntries.length > 0 ? (
                <LoadBalanceBar entries={dashboardModel.loadEntries} />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Add family members to see the load distribution.
                </Typography>
              )}
            </WorkspacePanel>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1.15fr 0.85fr' },
              gap: 2
            }}
          >
            <WorkspacePanel title="Today" subtitle="Tasks due before the day is done.">
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
                        secondary={`${task.assignedTo.name} - ${formatCalendarDay(task.dueDate)}`}
                        primaryTypographyProps={{ fontWeight: 900 }}
                      />
                    </ListItem>
                    {index < summary.todayTasks.length - 1 && <Divider />}
                  </Box>
                ))}
                {summary.todayTasks.length === 0 && (
                  <Typography color="text.secondary" variant="body2">
                    Nothing is due today.
                  </Typography>
                )}
              </List>
            </WorkspacePanel>

            <WorkspacePanel title="Prep Queue" subtitle="Suggested packs for events coming soon.">
              <Stack spacing={1.5}>
                {dashboardModel.prepPacks.map((pack) => (
                  <PrepPackCard key={pack.id} pack={pack} />
                ))}
                {dashboardModel.prepPacks.length === 0 && (
                  <Typography color="text.secondary" variant="body2">
                    No event preparation needed right now.
                  </Typography>
                )}
              </Stack>
            </WorkspacePanel>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
              gap: 2
            }}
          >
            <WorkspacePanel title="Week Ahead" subtitle="Events and reminders ALBIS is watching.">
              <Stack spacing={2}>
                {summary.upcomingEvents.map((event) => (
                  <Stack
                    key={event._id}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <Box>
                      <Typography fontWeight={900}>{event.title}</Typography>
                      <Typography color="text.secondary" variant="body2">
                        {formatDateTime(event.date)}
                      </Typography>
                    </Box>
                    <Chip size="small" label={event.type} variant="outlined" />
                  </Stack>
                ))}
                {summary.pendingReminders.map((reminder) => (
                  <Stack
                    key={reminder._id}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <Box>
                      <Typography fontWeight={900}>{reminder.title}</Typography>
                      <Typography color="text.secondary" variant="body2">
                        {reminder.message}
                      </Typography>
                    </Box>
                    <Chip size="small" label={formatShortDate(reminder.date)} color="warning" />
                  </Stack>
                ))}
              </Stack>
            </WorkspacePanel>

            <WorkspacePanel title="Family Activity" subtitle="Recent updates in the household.">
              <List disablePadding>
                {summary.activityFeed.map((activity) => (
                  <ListItem key={activity._id} disableGutters>
                    <ListItemAvatar>
                      <Chip label={activity.user.name.slice(0, 1)} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.action}
                      secondary={formatDateTime(activity.timestamp)}
                      primaryTypographyProps={{ fontWeight: 900 }}
                    />
                  </ListItem>
                ))}
              </List>
            </WorkspacePanel>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
              gap: 2
            }}
          >
            <WorkspacePanel title="Task Completion" subtitle="Progress across family work.">
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 180px' },
                  gap: 2,
                  alignItems: 'center'
                }}
              >
                <Box sx={{ height: 270 }}>
                  <PieChart
                    height={270}
                    colors={chartColors}
                    series={[
                      {
                        data: dashboardModel.taskCompletionChart,
                        innerRadius: 66,
                        outerRadius: 96,
                        paddingAngle: 3,
                        cornerRadius: 6,
                        startAngle: -90,
                        endAngle: 270,
                        highlightScope: { fade: 'global', highlight: 'item' },
                        faded: {
                          innerRadius: 66,
                          additionalRadius: -8,
                          color: theme.palette.action.disabled
                        },
                        valueFormatter: (item) => `${item.value} tasks`
                      }
                    ]}
                    margin={{ left: 8, right: 8, top: 10, bottom: 10 }}
                    hideLegend
                    sx={{
                      '& .MuiChartsArc-root': {
                        stroke: theme.palette.background.paper,
                        strokeWidth: 2
                      }
                    }}
                  />
                </Box>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h4" fontWeight={900}>
                      {dashboardModel.completedTasks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      completed family tasks
                    </Typography>
                  </Box>
                  <ChartLegend items={dashboardModel.taskCompletionChart} />
                </Stack>
              </Box>
            </WorkspacePanel>

            <WorkspacePanel title="Event Mix" subtitle="What kind of family time is coming up.">
              <Stack spacing={2}>
                <Box sx={{ height: 270 }}>
                  <BarChart
                    height={270}
                    dataset={dashboardModel.eventMixChart}
                    xAxis={[
                      {
                        scaleType: 'band',
                        dataKey: 'label',
                        tickLabelStyle: {
                          fill: theme.palette.text.secondary,
                          fontSize: 11,
                          fontWeight: 700
                        }
                      }
                    ]}
                    yAxis={[
                      {
                        width: 34,
                        tickMinStep: 1,
                        tickLabelStyle: {
                          fill: theme.palette.text.secondary,
                          fontSize: 11
                        }
                      }
                    ]}
                    series={[
                      {
                        dataKey: 'value',
                        label: 'Events',
                        color: '#0891B2',
                        valueFormatter: (value) => `${value ?? 0} events`
                      }
                    ]}
                    borderRadius={8}
                    grid={{ horizontal: true }}
                    margin={{ left: 4, right: 12, top: 22, bottom: 44 }}
                    hideLegend
                    sx={{
                      '& .MuiChartsAxis-line': {
                        stroke: theme.palette.divider
                      },
                      '& .MuiChartsAxis-tick': {
                        stroke: theme.palette.divider
                      },
                      '& .MuiChartsGrid-line': {
                        stroke: alpha(theme.palette.text.secondary, 0.16)
                      }
                    }}
                  />
                </Box>
                <ChartLegend items={dashboardModel.eventMixChart} />
              </Stack>
            </WorkspacePanel>
          </Box>
        </Stack>
      )}
    </Box>
  );
};
