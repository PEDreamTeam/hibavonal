import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  MenuItem,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import useSignup from '../../api/hooks/useSignup';
import useAppStore from '../../store/useAppStore';

const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'maintainer', label: 'Maintainer' },
  { value: 'maintenance_manager', label: 'Maintenance Manager' },
  { value: 'admin', label: 'Admin' },
];

const Signup = () => {
  const navigate = useNavigate();
  const setAuth = useAppStore((s) => s.setAuth);
  const { signup, isLoading, error, resetError } = useSignup();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetError();

    const data = await signup({ username, email, password, role });
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
          Sign Up
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            label="Username"
            fullWidth
            required
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
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
          <TextField
            label="Role"
            select
            fullWidth
            margin="normal"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {ROLES.map((r) => (
              <MenuItem key={r.value} value={r.value}>
                {r.label}
              </MenuItem>
            ))}
          </TextField>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isLoading}
            sx={{ mt: 2, mb: 2 }}
          >
            {isLoading ? 'Signing up...' : 'Sign Up'}
          </Button>
        </Box>

        <Typography variant="body2">
          Already have an account? <RouterLink to="/login">Login</RouterLink>
        </Typography>
      </Box>
    </Container>
  );
};

export default Signup;
