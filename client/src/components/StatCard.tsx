import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';

export const StatCard = ({
  label,
  value,
  icon,
  detail,
  tone = 'primary'
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  detail?: string;
  tone?: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
}) => (
  <Card
    variant="outlined"
    sx={{
      height: '100%',
      transition: 'border-color 160ms ease, transform 160ms ease',
      '&:hover': {
        borderColor: `${tone}.main`,
        transform: 'translateY(-1px)'
      }
    }}
  >
    <CardContent sx={{ p: 2.25 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary" fontWeight={800}>
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={800}>
            {value}
          </Typography>
          {detail && (
            <Typography variant="caption" color="text.secondary">
              {detail}
            </Typography>
          )}
        </Stack>
        <Box
          sx={{
            width: 42,
            height: 42,
            display: 'grid',
            placeItems: 'center',
            color: `${tone}.main`,
            bgcolor: (theme) => alpha(theme.palette[tone].main, 0.11),
            borderRadius: 1
          }}
        >
          {icon}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);
