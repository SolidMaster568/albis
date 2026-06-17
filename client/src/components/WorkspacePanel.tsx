import { Box, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export const WorkspacePanel = ({
  title,
  subtitle,
  action,
  children,
  dense = false
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  dense?: boolean;
}) => (
  <Paper
    variant="outlined"
    sx={{
      p: dense ? 2 : { xs: 2, sm: 2.5 },
      borderRadius: 1,
      bgcolor: 'background.paper'
    }}
  >
    {(title || subtitle || action) && (
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'flex-start' }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Box>
          {title && (
            <Typography variant="h6" fontWeight={900}>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Stack>
    )}
    {children}
  </Paper>
);
