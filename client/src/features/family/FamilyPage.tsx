import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography
} from '@mui/material';
import { isAfter } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { ErrorAlert } from '../../components/ErrorAlert';
import { LoadingState } from '../../components/LoadingState';
import { PageHeader } from '../../components/PageHeader';
import { fetchEvents } from '../calendar/calendarSlice';
import { fetchTasks } from '../tasks/tasksSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import type { FamilyRole } from '../../types/domain';
import type { InviteFormValues } from '../../types/forms';
import { fetchCurrentFamily, inviteMember, updateMemberRole } from './familySlice';
import { InviteMemberDialog } from './InviteMemberDialog';

const roles: FamilyRole[] = ['Parent', 'Partner', 'Child'];

export const FamilyPage = () => {
  const dispatch = useAppDispatch();
  const { family, status, saving, error } = useAppSelector((state) => state.family);
  const fallbackFamily = useAppSelector((state) => state.auth.family);
  const tasks = useAppSelector((state) => state.tasks.items);
  const events = useAppSelector((state) => state.calendar.events);
  const currentFamily = family ?? fallbackFamily;
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCurrentFamily());
    dispatch(fetchTasks());
    dispatch(fetchEvents());
  }, [dispatch]);

  const upcomingEventsCount = useMemo(
    () => events.filter((event) => isAfter(new Date(event.date), new Date())).length,
    [events]
  );

  const handleInvite = (values: InviteFormValues) => {
    dispatch(inviteMember(values)).then(() => setInviteOpen(false));
  };

  if (status === 'loading' && !currentFamily) {
    return <LoadingState label="Loading family" />;
  }

  return (
    <Box>
      <PageHeader
        title="Family Members"
        action={
          <Button
            variant="contained"
            startIcon={<PersonAddAltOutlinedIcon />}
            onClick={() => setInviteOpen(true)}
          >
            Invite
          </Button>
        }
      />
      <Stack spacing={2}>
        <ErrorAlert message={error} />
        {!currentFamily ? (
          <EmptyState title="No family workspace found" />
        ) : (
          <>
            <Typography variant="h6" fontWeight={900}>
              {currentFamily.name}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, minmax(0, 1fr))',
                  xl: 'repeat(4, minmax(0, 1fr))'
                },
                gap: 2
              }}
            >
              {currentFamily.members.map((member) => {
                const assignedTasks = tasks.filter(
                  (task) => task.assignedTo._id === member.user._id && task.status !== 'Completed'
                ).length;

                return (
                  <Card key={member.user._id} variant="outlined">
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar src={member.user.avatar}>
                            {member.user.name.slice(0, 1).toUpperCase()}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography fontWeight={900} noWrap>
                              {member.user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {member.user.email}
                            </Typography>
                          </Box>
                        </Stack>
                        <FormControl size="small" fullWidth>
                          <InputLabel>Role</InputLabel>
                          <Select
                            label="Role"
                            value={member.role}
                            onChange={(event) =>
                              dispatch(
                                updateMemberRole({
                                  userId: member.user._id,
                                  role: event.target.value as FamilyRole
                                })
                              )
                            }
                          >
                            {roles.map((role) => (
                              <MenuItem key={role} value={role}>
                                {role}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip label={`${assignedTasks} assigned tasks`} />
                          <Chip label={`${upcomingEventsCount} upcoming events`} variant="outlined" />
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </>
        )}
      </Stack>
      <InviteMemberDialog
        open={inviteOpen}
        saving={saving}
        onClose={() => setInviteOpen(false)}
        onSubmit={handleInvite}
      />
    </Box>
  );
};
