import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { Alert, Button, Link, Stack, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import { ErrorAlert } from '../../components/ErrorAlert';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import type { ForgotPasswordFormValues } from '../../types/forms';
import { AuthLayout } from './AuthLayout';
import { forgotPassword } from './authSlice';

export const ForgotPasswordPage = () => {
  const dispatch = useAppDispatch();
  const { status, error, resetMessage } = useAppSelector((state) => state.auth);
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: { email: '' }
  });

  return (
    <AuthLayout title="Reset Password">
      <Stack
        component="form"
        spacing={2.5}
        onSubmit={handleSubmit((values) => dispatch(forgotPassword(values)))}
      >
        <ErrorAlert message={error} />
        {resetMessage && <Alert severity="success">{resetMessage}</Alert>}
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
        <Button
          type="submit"
          variant="contained"
          size="large"
          startIcon={<MailOutlineIcon />}
          disabled={status === 'loading'}
        >
          Send reset link
        </Button>
        <Link component={RouterLink} to="/login" variant="body2" textAlign="center">
          Back to sign in
        </Link>
      </Stack>
    </AuthLayout>
  );
};
