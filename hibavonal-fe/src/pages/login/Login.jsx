import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import useLogin from '../../api/hooks/useLogin';
import useAppStore from '../../store/useAppStore';

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAppStore((s) => s.setAuth);
  const { login, isLoading, error, resetError } = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetError();

    const data = await login({ email, password });
    if (data) {
      setAuth(data.user, data.token);
      navigate('/');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          py: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isLoading}
            sx={{ mt: 2, mb: 2 }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </Box>

        <Typography variant="body2">
          Don&apos;t have an account?{' '}
          <RouterLink to="/signup">Sign up</RouterLink>
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;
