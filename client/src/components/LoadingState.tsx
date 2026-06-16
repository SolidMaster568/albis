import { Box, CircularProgress, Typography } from '@mui/material';

export const LoadingState = ({ label = 'Loading' }: { label?: string }) => (
  <Box
    sx={{
      minHeight: 220,
      display: 'grid',
      placeItems: 'center',
      gap: 1
    }}
  >
    <CircularProgress size={28} />
    <Typography color="text.secondary" variant="body2">
      {label}
    </Typography>
  </Box>
);
