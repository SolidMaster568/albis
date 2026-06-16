import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { Avatar, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ErrorAlert } from '../../components/ErrorAlert';
import { PageHeader } from '../../components/PageHeader';
import { updateProfile } from '../auth/authSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import type { ProfileFormValues } from '../../types/forms';

export const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const { user, profileStatus, error } = useAppSelector((state) => state.auth);
  const { control, handleSubmit, reset, watch } = useForm<ProfileFormValues>({
    defaultValues: {
      name: user?.name ?? '',
      avatar: user?.avatar ?? ''
    }
  });
  const avatar = watch('avatar');
  const name = watch('name');

  useEffect(() => {
    reset({
      name: user?.name ?? '',
      avatar: user?.avatar ?? ''
    });
  }, [reset, user]);

  return (
    <Box>
      <PageHeader title="Profile" />
      <Stack spacing={2}>
        <ErrorAlert message={error} />
        <Card variant="outlined" sx={{ maxWidth: 680 }}>
          <CardContent>
            <Stack
              component="form"
              spacing={3}
              onSubmit={handleSubmit((values) => dispatch(updateProfile(values)))}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar src={avatar} sx={{ width: 72, height: 72 }}>
                  {name?.slice(0, 1).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    {user?.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Account profile
                  </Typography>
                </Box>
              </Stack>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Name is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Name"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    fullWidth
                  />
                )}
              />
              <Controller
                name="avatar"
                control={control}
                render={({ field }) => <TextField {...field} label="Avatar URL" fullWidth />}
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveOutlinedIcon />}
                disabled={profileStatus === 'loading'}
                sx={{ alignSelf: 'flex-start' }}
              >
                Save profile
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};
