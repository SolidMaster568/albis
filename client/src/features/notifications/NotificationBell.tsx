import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import {
  Badge,
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  Tooltip,
  Typography
} from '@mui/material';
import { useState } from 'react';
import { formatDateTime } from '../../components/date';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { markNotificationRead } from './notificationsSlice';

export const NotificationBell = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications.items);
  const unread = notifications.filter((item) => !item.read).length;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton color="inherit" onClick={(event) => setAnchorEl(event.currentTarget)}>
          <Badge color="error" badgeContent={unread}>
            <NotificationsOutlinedIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          paper: {
            sx: { width: 340, maxWidth: 'calc(100vw - 32px)' }
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={800}>
            Notifications
          </Typography>
        </Box>
        <Divider />
        <List disablePadding>
          {notifications.length === 0 ? (
            <Box sx={{ px: 2, py: 4 }}>
              <Typography color="text.secondary" variant="body2">
                No notifications
              </Typography>
            </Box>
          ) : (
            notifications.map((notification) => (
              <ListItemButton
                key={notification._id}
                onClick={() => dispatch(markNotificationRead(notification._id))}
                sx={{
                  alignItems: 'flex-start',
                  bgcolor: notification.read ? 'transparent' : 'action.hover'
                }}
              >
                <ListItemText
                  primary={notification.title}
                  secondary={`${notification.message} · ${formatDateTime(notification.createdAt)}`}
                  primaryTypographyProps={{ fontWeight: 800 }}
                />
              </ListItemButton>
            ))
          )}
        </List>
      </Menu>
    </>
  );
};
