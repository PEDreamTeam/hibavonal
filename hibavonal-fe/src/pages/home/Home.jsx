import { Container, Box, Typography, Button, Stack } from '@mui/material';
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
        <Stack direction="column" spacing={2} sx={{ width: '100%' }}>
          <Button
            component={RouterLink}
            to="/create"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
          >
            Hiba bejelentése
          </Button>
          <Button
            component={RouterLink}
            to="/login"
            variant="outlined"
            color="primary"
            size="large"
            fullWidth
          >
            Go to Login
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
