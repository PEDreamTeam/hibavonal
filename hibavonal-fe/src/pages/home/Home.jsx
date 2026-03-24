import { Container, Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function Home() {
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
          Home
        </Typography>
        <Typography variant="h6" color="textSecondary" paragraph>
          Welcome to the home page!
        </Typography>
        <Button
          component={RouterLink}
          to="/login"
          variant="contained"
          color="primary"
          size="large"
        >
          Go to Login
        </Button>
      </Box>
    </Container>
  );
}
