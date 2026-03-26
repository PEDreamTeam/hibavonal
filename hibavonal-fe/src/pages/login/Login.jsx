import { Container, Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function Login() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          py: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '95vw',
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Login
        </Typography>
        <Typography variant="h6" color="textSecondary" paragraph>
          This is the login page.
        </Typography>
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          color="primary"
          size="large"
        >
          Go to Home
        </Button>
      </Box>
    </Container>
  );
}
