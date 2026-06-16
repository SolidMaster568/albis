import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField
} from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { InviteFormValues } from '../../types/forms';

const roles = ['Parent', 'Partner', 'Child'] as const;

const defaultValues: InviteFormValues = {
  name: '',
  email: '',
  role: 'Partner'
};

export const InviteMemberDialog = ({
  open,
  saving,
  onClose,
  onSubmit
}: {
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: InviteFormValues) => void;
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<InviteFormValues>({ defaultValues });

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Invite Member</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="invite-form"
          spacing={2.5}
          sx={{ mt: 1 }}
          onSubmit={handleSubmit(onSubmit)}
        >
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
            name="role"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.role)}>
                <InputLabel>Role</InputLabel>
                <Select {...field} label="Role">
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.role?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="invite-form" variant="contained" disabled={saving}>
          Send invite
        </Button>
      </DialogActions>
    </Dialog>
  );
};
