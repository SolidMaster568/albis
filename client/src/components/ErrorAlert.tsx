import { Alert } from '@mui/material';

export const ErrorAlert = ({ message }: { message?: string | null }) => {
  if (!message) {
    return null;
  }

  return <Alert severity="error">{message}</Alert>;
};
