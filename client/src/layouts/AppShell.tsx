import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import FamilyRestroomOutlinedIcon from '@mui/icons-material/FamilyRestroomOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { fetchCurrentFamily } from '../features/family/familySlice';
import { fetchNotifications } from '../features/notifications/notificationsSlice';
import { NotificationBell } from '../features/notifications/NotificationBell';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { useColorMode } from '../theme/ColorModeProvider';
import { logout } from '../features/auth/authSlice';

const drawerWidth = 260;

const navItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardOutlinedIcon /> },
  { label: 'Tasks', path: '/tasks', icon: <ChecklistOutlinedIcon /> },
  { label: 'Calendar', path: '/calendar', icon: <CalendarMonthOutlinedIcon /> },
  { label: 'Assistant', path: '/assistant', icon: <AutoAwesomeOutlinedIcon /> },
  { label: 'Reminders', path: '/reminders', icon: <NotificationsActiveOutlinedIcon /> },
  { label: 'Family', path: '/family', icon: <FamilyRestroomOutlinedIcon /> },
  { label: 'Profile', path: '/profile', icon: <PersonOutlineOutlinedIcon /> }
];

const Sidebar = ({ onNavigate }: { onNavigate?: () => void }) => {
  const family = useAppSelector((state) => state.family.family ?? state.auth.family);

  return (
    <Stack sx={{ height: '100%', px: 2, py: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ px: 1, mb: 2 }}>
        <Avatar
          src="/albis-mark.svg"
          variant="rounded"
          sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography fontWeight={900} noWrap>
            ALBIS
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {family?.name ?? 'Family workspace'}
          </Typography>
        </Box>
      </Stack>
      <Stack component="nav" spacing={0.5}>
        {navItems.map((item) => (
          <Button
            key={item.path}
            component={NavLink}
            to={item.path}
            onClick={onNavigate}
            startIcon={item.icon}
            sx={{
              justifyContent: 'flex-start',
              px: 1.5,
              color: 'text.secondary',
              '&.active': {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                color: 'primary.main'
              }
            }}
          >
            {item.label}
          </Button>
        ))}
      </Stack>
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ my: 2 }} />
      <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
        MVP workspace
      </Typography>
    </Stack>
  );
};

export const AppShell = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { mode, toggleMode } = useColorMode();
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentFamily());
      dispatch(fetchNotifications());
    }
  }, [dispatch, token]);

  const initials = useMemo(
    () =>
      user?.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    [user?.name]
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` }
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {!isDesktop && (
            <IconButton edge="start" onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <NotificationBell />
          <Tooltip title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
            <IconButton color="inherit" onClick={toggleMode}>
              {mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
            </IconButton>
          </Tooltip>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar src={user?.avatar} sx={{ width: 34, height: 34 }}>
              {initials}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" fontWeight={800}>
                {user?.name}
              </Typography>
            </Box>
          </Stack>
          <Tooltip title="Log out">
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth }
          }}
        >
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              borderRight: 1,
              borderColor: 'divider'
            }
          }}
          open
        >
          <Sidebar />
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          px: { xs: 2, sm: 3 },
          py: 3,
          mt: 8
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
