import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Box, Chip, LinearProgress, Stack, Typography } from '@mui/material';

export type PrepPack = {
  id: string;
  title: string;
  type: string;
  dueLabel: string;
  progress: number;
  items: string[];
};

export const PrepPackCard = ({ pack }: { pack: PrepPack }) => (
  <Stack
    spacing={1.5}
    sx={{
      p: 2,
      border: 1,
      borderColor: 'divider',
      borderRadius: 1,
      bgcolor: 'background.paper'
    }}
  >
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Box sx={{ minWidth: 0 }}>
        <Typography fontWeight={900} noWrap>
          {pack.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {pack.type} - {pack.dueLabel}
        </Typography>
      </Box>
      <Chip size="small" label={`${pack.progress}%`} color="primary" variant="outlined" />
    </Stack>
    <LinearProgress
      variant="determinate"
      value={pack.progress}
      sx={{ height: 7, borderRadius: 1, bgcolor: 'action.hover' }}
    />
    <Stack spacing={0.75}>
      {pack.items.map((item) => (
        <Stack key={item} direction="row" spacing={1} alignItems="center">
          <CheckCircleOutlineIcon color="success" fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            {item}
          </Typography>
        </Stack>
      ))}
    </Stack>
  </Stack>
);
