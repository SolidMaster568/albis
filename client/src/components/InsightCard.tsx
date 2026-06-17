import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';

export const InsightCard = ({
  label,
  title,
  body,
  icon,
  tone = 'primary'
}: {
  label: string;
  title: string;
  body: string;
  icon: ReactNode;
  tone?: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
}) => (
  <Stack
    spacing={1.25}
    sx={{
      p: 2,
      border: 1,
      borderColor: 'divider',
      borderRadius: 1,
      bgcolor: (theme) => alpha(theme.palette[tone].main, theme.palette.mode === 'light' ? 0.06 : 0.14)
    }}
  >
    <Stack direction="row" justifyContent="space-between" spacing={1.5}>
      <Typography variant="caption" color="text.secondary" fontWeight={900}>
        {label}
      </Typography>
      <Box sx={{ color: `${tone}.main`, display: 'flex' }}>{icon}</Box>
    </Stack>
    <Typography fontWeight={900}>{title}</Typography>
    <Typography variant="body2" color="text.secondary">
      {body}
    </Typography>
  </Stack>
);
