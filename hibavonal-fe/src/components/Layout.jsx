import { useState } from 'react';
import {
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import LogoutIcon from '@mui/icons-material/Logout';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import BuildIcon from '@mui/icons-material/Build';
import CategoryIcon from '@mui/icons-material/Category';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
const DRAWER_WIDTH = 250;

const Layout = ({ children }) => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAppStore();

  const handleDrawerToggle = () => {
    setOpenDrawer(!openDrawer);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setOpenDrawer(false);
  };

  const handleLogout = () => {
    logout();
    setOpenDrawer(false);
    navigate('/login');
  };

  const menuItems = [{ label: 'Home', icon: <HomeIcon />, path: '/' }];

  if (isAuthenticated && user?.role === 'admin') {
    menuItems.push({
      label: 'Rooms',
      icon: <MeetingRoomIcon />,
      path: '/rooms',
    });
  }

  if (!isAuthenticated) {
    menuItems.push(
      { label: 'Login', icon: <LoginIcon />, path: '/login' },
      { label: 'Sign Up', icon: <PersonAddIcon />, path: '/signup' },
      { label: 'Tool order', icon: <BuildIcon />, path: '/tool-order' },
      {
        label: 'Add ticket type',
        icon: <CategoryIcon />,
        path: '/ticket-types/new',
      }
    );
  }

  const drawerContent = (
    <Box sx={{ width: DRAWER_WIDTH }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />

      {isAuthenticated && (
        <>
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {user?.username || user?.email}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {user?.role}
            </Typography>
          </Box>
          <Divider />
        </>
      )}

      <List sx={{ cursor: 'pointer' }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}

        {isAuthenticated && (
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <Box>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">{user?.username}</Typography>
              <Button color="inherit" size="small" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          ) : (
            <Button color="inherit" onClick={() => navigate('/login')}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={openDrawer}
        onClose={handleDrawerToggle}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            marginTop: '64px',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 8,
          p: 2,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
