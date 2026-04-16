import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';

function TabPanel({ children, value, index }) {
  return (
    <Box hidden={value !== index} sx={{ width: '100%' }}>
      {value === index && children}
    </Box>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, login, register, loading, error } = useAppStore();
  const [tabValue, setTabValue] = useState(0);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'maintenance',
  });
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!loginData.username || !loginData.password) {
      setLocalError('Kérjük töltsön ki minden mezőt');
      return;
    }

    try {
      await login(loginData.username, loginData.password);
      navigate('/');
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!registerData.username || !registerData.password || !registerData.confirmPassword) {
      setLocalError('Kérjük töltsön ki minden mezőt');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setLocalError('A jelszavak nem egyeznek');
      return;
    }

    try {
      await register(registerData.username, registerData.password, registerData.role);
      setLoginData({ username: '', password: '' });
      setRegisterData({ username: '', password: '', confirmPassword: '', role: 'maintenance' });
      setTabValue(0);
      setLocalError('Sikeres regisztráció! Most jelentkezz be.');
    } catch (err) {
      setLocalError(err.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          py: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
          Hibajelentő Rendszer
        </Typography>

        {(localError || error) && (
          <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
            {localError || error}
          </Alert>
        )}

        <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Bejelentkezés" />
            <Tab label="Regisztráció" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box component="form" onSubmit={handleLoginSubmit} sx={{ width: '100%', pt: 3 }}>
            <TextField
              fullWidth
              label="Felhasználónév"
              name="username"
              value={loginData.username}
              onChange={handleLoginChange}
              margin="normal"
              disabled={loading}
              autoComplete="username"
            />
            <TextField
              fullWidth
              label="Jelszó"
              name="password"
              type="password"
              value={loginData.password}
              onChange={handleLoginChange}
              margin="normal"
              disabled={loading}
              autoComplete="current-password"
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Bejelentkezés'}
            </Button>

            <Typography variant="body2" color="textSecondary" sx={{ mt: 2, textAlign: 'center' }}>
              Teszteléshez használd: <br />
              <strong>Diák:</strong> student / pass123 <br />
              <strong>Karbantartó:</strong> maintenance / pass123 <br />
              <strong>Admin:</strong> admin / pass123
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box component="form" onSubmit={handleRegisterSubmit} sx={{ width: '100%', pt: 3 }}>
            <TextField
              fullWidth
              label="Felhasználónév"
              name="username"
              value={registerData.username}
              onChange={handleRegisterChange}
              margin="normal"
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Jelszó"
              name="password"
              type="password"
              value={registerData.password}
              onChange={handleRegisterChange}
              margin="normal"
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Jelszó megerősítése"
              name="confirmPassword"
              type="password"
              value={registerData.confirmPassword}
              onChange={handleRegisterChange}
              margin="normal"
              disabled={loading}
            />
            <FormControl fullWidth margin="normal" disabled={loading}>
              <InputLabel>Szerepkör</InputLabel>
              <Select
                name="role"
                value={registerData.role}
                label="Szerepkör"
                onChange={handleRegisterChange}
              >
                <MenuItem value="student">Diák</MenuItem>
                <MenuItem value="maintenance">Karbantartó</MenuItem>
              </Select>
            </FormControl>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Regisztráció'}
            </Button>
          </Box>
        </TabPanel>
      </Box>
    </Container>
  );
}

