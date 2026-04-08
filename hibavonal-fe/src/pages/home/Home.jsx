import { Container, Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Home = () => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          py: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Home
        </Typography>
        <Typography variant="h6" color="textSecondary" paragraph>
          Welcome to the home page!
        </Typography>
        This is the home page of the application. You can navigate to different
        sections using the menu.
      </Box>
    </Container>
  );
};

export default Home;
