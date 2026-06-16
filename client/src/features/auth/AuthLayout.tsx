import { Avatar, Box, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export const AuthLayout = ({ title, children }: { title: string; children: ReactNode }) => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      bgcolor: 'background.default',
      px: 2,
      py: 4
    }}
  >
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        width: '100%',
        maxWidth: 440,
        p: { xs: 3, sm: 4 }
      }}
    >
      <Stack spacing={3}>
        <Stack alignItems="center" spacing={1}>
          <Avatar
            src="/albis-mark.svg"
            variant="rounded"
            sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}
          />
          <Typography variant="h4" component="h1" fontWeight={900}>
            {title}
          </Typography>
        </Stack>
        {children}
      </Stack>
    </Paper>
  </Box>
);
