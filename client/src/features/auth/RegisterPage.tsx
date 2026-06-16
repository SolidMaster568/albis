import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import { Button, Link, Stack, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import { ErrorAlert } from '../../components/ErrorAlert';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import type { RegisterFormValues } from '../../types/forms';
import { AuthLayout } from './AuthLayout';
import { register } from './authSlice';

export const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const { token, status, error } = useAppSelector((state) => state.auth);
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      familyName: ''
    }
  });

  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout title="Create ALBIS">
      <Stack
        component="form"
        spacing={2.5}
        onSubmit={handleSubmit((values) => dispatch(register(values)))}
      >
        <ErrorAlert message={error} />
        <Controller
          name="name"
          control={control}
          rules={{ required: 'Name is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Name"
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              fullWidth
            />
          )}
        />
        <Controller
          name="email"
          control={control}
          rules={{ required: 'Email is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              type="email"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              fullWidth
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          rules={{
            required: 'Password is required',
            minLength: { value: 8, message: 'Use at least 8 characters' }
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Password"
              type="password"
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              fullWidth
            />
          )}
        />
        <Controller
          name="familyName"
          control={control}
          render={({ field }) => <TextField {...field} label="Family name" fullWidth />}
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          startIcon={<PersonAddAltOutlinedIcon />}
          disabled={status === 'loading'}
        >
          Create account
        </Button>
        <Link component={RouterLink} to="/login" variant="body2" textAlign="center">
          Back to sign in
        </Link>
      </Stack>
    </AuthLayout>
  );
};
