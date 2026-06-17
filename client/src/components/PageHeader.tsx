import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export const PageHeader = ({
  title,
  eyebrow,
  subtitle,
  action
}: {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  action?: ReactNode;
}) => (
  <Stack
    direction={{ xs: 'column', sm: 'row' }}
    justifyContent="space-between"
    alignItems={{ xs: 'stretch', sm: 'center' }}
    spacing={2}
    sx={{ mb: 3 }}
  >
    <Box sx={{ maxWidth: 780 }}>
      {eyebrow && (
        <Typography
          variant="overline"
          color="primary"
          fontWeight={900}
          sx={{ display: 'block', lineHeight: 1.4 }}
        >
          {eyebrow}
        </Typography>
      )}
      <Typography variant="h4" component="h1" fontWeight={900}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
    {action}
  </Stack>
);
