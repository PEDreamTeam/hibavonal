import { useState, useEffect } from 'react';
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
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import BuildIcon from '@mui/icons-material/Build';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';

const DRAWER_WIDTH = 250;

export default function Layout({ children }) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, fetchCurrentUser, logout } = useAppStore();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const handleDrawerToggle = () => {
    setOpenDrawer(!openDrawer);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setOpenDrawer(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setOpenDrawer(false);
  };

  const menuItems = [
    { label: 'Kezdőlap', icon: <HomeIcon />, path: '/' },
    ...(isAuthenticated && user?.role !== 'student'
      ? [{ label: 'Szerszámrendelések', icon: <BuildIcon />, path: '/tool-orders' }]
      : []),
    ...(!isAuthenticated
      ? [{ label: 'Bejelentkezés', icon: <LoginIcon />, path: '/login' }]
      : []),
  ];

  const drawerContent = (
    <Box sx={{ width: DRAWER_WIDTH, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ flex: 1 }}>
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
        </List>
      </Box>
      {isAuthenticated && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 2, fontSize: '0.875rem' }}>
              <div>
                <strong>{user?.username}</strong>
              </div>
              <div sx={{
                fontSize: '0.75rem',
                color: '#666',
              }}>
                {user?.role === 'maintenance' ? 'Karbantartó' : user?.role === 'admin' ? 'Adminisztrátor' : 'Diák'}
              </div>
            </Box>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              size="small"
            >
              Kijelentkezés
            </Button>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
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
          <Box sx={{ flexGrow: 1, fontSize: '1.25rem', fontWeight: 'bold' }}>
            Hibajelentő Rendszer
          </Box>
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
            height: 'calc(100vh - 64px)',
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
}

