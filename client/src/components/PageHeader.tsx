import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export const PageHeader = ({
  title,
  action
}: {
  title: string;
  action?: ReactNode;
}) => (
  <Stack
    direction={{ xs: 'column', sm: 'row' }}
    justifyContent="space-between"
    alignItems={{ xs: 'stretch', sm: 'center' }}
    spacing={2}
    sx={{ mb: 3 }}
  >
    <Box>
      <Typography variant="h4" component="h1" fontWeight={800}>
        {title}
      </Typography>
    </Box>
    {action}
  </Stack>
);
