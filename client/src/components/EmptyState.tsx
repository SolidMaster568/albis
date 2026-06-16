import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { Box, Typography } from '@mui/material';

export const EmptyState = ({ title }: { title: string }) => (
  <Box
    sx={{
      border: 1,
      borderColor: 'divider',
      borderRadius: 1,
      py: 6,
      px: 2,
      textAlign: 'center',
      bgcolor: 'background.paper'
    }}
  >
    <InboxOutlinedIcon color="disabled" />
    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
      {title}
    </Typography>
  </Box>
);
