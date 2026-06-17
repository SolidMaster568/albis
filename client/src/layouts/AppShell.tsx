import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
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
  Chip,
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
import { Link as RouterLink, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { fetchCurrentFamily } from '../features/family/familySlice';
import { fetchNotifications } from '../features/notifications/notificationsSlice';
import { NotificationBell } from '../features/notifications/NotificationBell';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { useColorMode } from '../theme/ColorModeProvider';
import { logout } from '../features/auth/authSlice';

const drawerWidth = 260;

const navGroups = [
  {
    label: 'Operate',
    items: [
      { label: 'Dashboard', path: '/', icon: <DashboardOutlinedIcon /> },
      { label: 'Tasks', path: '/tasks', icon: <ChecklistOutlinedIcon /> },
      { label: 'Events', path: '/events', icon: <EventAvailableOutlinedIcon /> },
      { label: 'Calendar', path: '/calendar', icon: <CalendarMonthOutlinedIcon /> },
      { label: 'Reminders', path: '/reminders', icon: <NotificationsActiveOutlinedIcon /> }
    ]
  },
  {
    label: 'Coordinate',
    items: [
      { label: 'Assistant', path: '/assistant', icon: <AutoAwesomeOutlinedIcon /> },
      { label: 'Family', path: '/family', icon: <FamilyRestroomOutlinedIcon /> },
      { label: 'Profile', path: '/profile', icon: <PersonOutlineOutlinedIcon /> }
    ]
  }
];

const Sidebar = ({ onNavigate }: { onNavigate?: () => void }) => {
  const family = useAppSelector((state) => state.family.family ?? state.auth.family);

  return (
    <Stack sx={{ height: '100%', px: 2, py: 2 }}>
      <Stack
        component={RouterLink}
        to="/"
        direction="row"
        alignItems="center"
        spacing={1.25}
        onClick={onNavigate}
        aria-label="Go to ALBIS dashboard"
        sx={{
          px: 0.5,
          mb: 2.5,
          borderRadius: 1,
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
            width: 38,
            height: 38,
            bgcolor: 'primary.main',
            boxShadow: (theme) => `0 8px 18px ${alpha(theme.palette.primary.main, 0.22)}`
          }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography fontWeight={900} noWrap>
            ALBIS
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            AI family operations
          </Typography>
        </Box>
      </Stack>
      {family?.name && (
        <Box
          sx={{
            px: 1.5,
            py: 1.25,
            mb: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'action.hover'
          }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={800}>
            WORKSPACE
          </Typography>
          <Typography variant="body2" fontWeight={900} noWrap>
            {family.name}
          </Typography>
        </Box>
      )}
      <Stack component="nav" spacing={2}>
        {navGroups.map((group) => (
          <Stack key={group.label} spacing={0.5}>
            <Typography variant="caption" color="text.secondary" fontWeight={900} sx={{ px: 1 }}>
              {group.label}
            </Typography>
            {group.items.map((item) => (
              <Button
                key={item.path}
                component={NavLink}
                to={item.path}
                onClick={onNavigate}
                startIcon={item.icon}
                sx={{
                  justifyContent: 'flex-start',
                  px: 1.25,
                  height: 42,
                  color: 'text.secondary',
                  border: 1,
                  borderColor: 'transparent',
                  '&.active': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.18),
                    color: 'primary.main'
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>
        ))}
      </Stack>
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ my: 2 }} />
      <Box sx={{ px: 1 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={900}>
          Less Mental Load.
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          More Family Life.
        </Typography>
      </Box>
    </Stack>
  );
};

export const AppShell = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { mode, toggleMode } = useColorMode();
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const [mobileOpen, setMobileOpen] = useState(false);
  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }).format(new Date()),
    []
  );
  const activePage = useMemo(() => {
    const allItems = navGroups.flatMap((group) => group.items);
    return allItems.find((item) => item.path === location.pathname)?.label ?? 'Dashboard';
  }, [location.pathname]);

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
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={900} noWrap>
              {activePage}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              Less Mental Load. More Family Life.
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Chip
            size="small"
            label={todayLabel}
            variant="outlined"
            sx={{ display: { xs: 'none', md: 'inline-flex' }, fontWeight: 800 }}
          />
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
          py: { xs: 2.5, sm: 3 },
          mt: 8
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
