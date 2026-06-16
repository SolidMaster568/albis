import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  Alert,
  Button,
  Link,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink, Navigate, useLocation } from 'react-router-dom';
import { ErrorAlert } from '../../components/ErrorAlert';
import { login } from './authSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import type { LoginFormValues } from '../../types/forms';
import { AuthLayout } from './AuthLayout';

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { token, status, error } = useAppSelector((state) => state.auth);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  useEffect(() => {
    setValue('email', 'john@albis.local');
    setValue('password', 'password123');
  }, [setValue]);

  if (token) {
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';
    return <Navigate to={from} replace />;
  }

  return (
    <AuthLayout title="ALBIS">
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit((values) => dispatch(login(values)))}>
        <Alert severity="info">Demo: john@albis.local / password123</Alert>
        <ErrorAlert message={error} />
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
          rules={{ required: 'Password is required' }}
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
        <Button
          type="submit"
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
          disabled={status === 'loading'}
        >
          Sign in
        </Button>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Link component={RouterLink} to="/forgot-password" variant="body2">
            Forgot password
          </Link>
          <Typography variant="body2">
            <Link component={RouterLink} to="/register">
              Create account
            </Link>
          </Typography>
        </Stack>
      </Stack>
    </AuthLayout>
  );
};
