import { Avatar, Box, LinearProgress, Stack, Typography } from '@mui/material';

export type LoadBalanceEntry = {
  id: string;
  name: string;
  role?: string;
  value: number;
  helper?: string;
  avatar?: string;
};

export const LoadBalanceBar = ({ entries }: { entries: LoadBalanceEntry[] }) => {
  const max = Math.max(1, ...entries.map((entry) => entry.value));

  return (
    <Stack spacing={1.75}>
      {entries.map((entry) => (
        <Stack key={entry.id} spacing={0.75}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Avatar src={entry.avatar} sx={{ width: 30, height: 30, fontSize: 13 }}>
              {entry.name.slice(0, 1).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="body2" fontWeight={900} noWrap>
                {entry.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {entry.helper ?? entry.role ?? 'Family member'}
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={900}>
              {entry.value}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={(entry.value / max) * 100}
            sx={{
              height: 7,
              borderRadius: 1,
              bgcolor: 'action.hover'
            }}
          />
        </Stack>
      ))}
    </Stack>
  );
};
