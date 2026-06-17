import { Avatar, Box, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export const AuthLayout = ({ title, children }: { title: string; children: ReactNode }) => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      px: 2,
      py: 4,
      background: (theme) =>
        theme.palette.mode === 'light'
          ? 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 48%, #ECFDF5 100%)'
          : 'linear-gradient(135deg, #0B1220 0%, #18213A 48%, #10261F 100%)'
    }}
  >
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        width: '100%',
        maxWidth: 460,
        p: { xs: 3, sm: 4 },
        bgcolor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'light' ? 0.88 : 0.82),
        backdropFilter: 'blur(18px)'
      }}
    >
      <Stack spacing={3}>
        <Stack alignItems="center" spacing={1}>
          <Box
            component={RouterLink}
            to="/"
            aria-label="Go to ALBIS"
            sx={{
              borderRadius: 1,
              display: 'inline-flex',
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: 3
              }
            }}
          >
            <Avatar
              src="/albis-mark.svg"
              variant="rounded"
              sx={{
                width: 54,
                height: 54,
                bgcolor: 'primary.main',
                boxShadow: (theme) => `0 10px 24px ${alpha(theme.palette.primary.main, 0.28)}`
              }}
            />
          </Box>
          <Typography variant="h4" component="h1" fontWeight={900}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Less Mental Load. More Family Life.
          </Typography>
        </Stack>
        {children}
      </Stack>
    </Paper>
  </Box>
);
