import AddIcon from '@mui/icons-material/Add';
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
import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { ErrorAlert } from '../../components/ErrorAlert';
import { LoadingState } from '../../components/LoadingState';
import { PageHeader } from '../../components/PageHeader';
import { PriorityChip, StatusChip } from '../../components/StatusChip';
import { formatDateTime } from '../../components/date';
import { fetchEvents } from '../calendar/calendarSlice';
import { fetchCurrentFamily } from '../family/familySlice';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import type { Task, TaskStatus } from '../../types/domain';
import type { TaskFormValues } from '../../types/forms';
import { createTask, deleteTask, fetchTasks, updateTask } from './tasksSlice';
import { TaskDialog } from './TaskDialog';

type TaskFilter = 'All' | TaskStatus;

const filters: TaskFilter[] = ['All', 'Pending', 'In Progress', 'Completed'];

export const TasksPage = () => {
  const dispatch = useAppDispatch();
  const { items, status, saving, error } = useAppSelector((state) => state.tasks);
  const { events } = useAppSelector((state) => state.calendar);
  const family = useAppSelector((state) => state.family.family ?? state.auth.family);
  const [filter, setFilter] = useState<TaskFilter>('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchEvents());
    if (!family) {
      dispatch(fetchCurrentFamily());
    }
  }, [dispatch, family]);

  const filteredTasks = useMemo(() => {
    const visible = filter === 'All' ? items : items.filter((task) => task.status === filter);
    return [...visible].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [filter, items]);

  const handleClose = () => {
    setDialogOpen(false);
    setEditingTask(null);
  };

  const handleSubmit = (values: TaskFormValues) => {
    if (editingTask) {
      dispatch(updateTask({ id: editingTask._id, values })).then(handleClose);
      return;
    }

    dispatch(createTask(values)).then(handleClose);
  };

  const handleDelete = (task: Task) => {
    if (window.confirm(`Delete "${task.title}"?`)) {
      dispatch(deleteTask(task._id));
    }
  };

  if (status === 'loading' && items.length === 0) {
    return <LoadingState label="Loading tasks" />;
  }

  return (
    <Box>
      <PageHeader
        title="Tasks"
        eyebrow="Ownership"
        subtitle="Track household work with clear owners, due dates and priority."
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
                setEditingTask(null);
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
        {filteredTasks.length === 0 ? (
          <EmptyState title="No tasks found" />
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
            {filteredTasks.map((task) => (
              <Card
                key={task._id}
                variant="outlined"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'border-color 160ms ease, transform 160ms ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" fontWeight={900} noWrap>
                          {task.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Family task
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <PriorityChip priority={task.priority} />
                        <StatusChip status={task.status} />
                      </Stack>
                    </Stack>
                    <Typography color="text.secondary" variant="body2">
                      {task.description || 'No description'}
                    </Typography>
                    {task.relatedEvent && (
                      <Chip
                        icon={<EventAvailableOutlinedIcon />}
                        label={`Event: ${task.relatedEvent.title}`}
                        variant="outlined"
                        sx={{
                          alignSelf: 'flex-start',
                          maxWidth: '100%',
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }
                        }}
                      />
                    )}
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Assigned
                        </Typography>
                        <Typography fontWeight={800}>{task.assignedTo.name}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary">
                          Due
                        </Typography>
                        <Typography fontWeight={800}>{formatDateTime(task.dueDate)}</Typography>
                      </Box>
                    </Stack>
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
                  <Tooltip title="Edit task">
                    <IconButton
                      onClick={() => {
                        setEditingTask(task);
                        setDialogOpen(true);
                      }}
                    >
                      <EditOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete task">
                    <IconButton color="error" onClick={() => handleDelete(task)}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Stack>
      <TaskDialog
        open={dialogOpen}
        task={editingTask}
        family={family}
        events={events}
        saving={saving}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </Box>
  );
};
