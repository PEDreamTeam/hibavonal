import { Navigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import { Typography, Container } from '@mui/material';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAppStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          Access Denied
        </Typography>
        <Typography color="textSecondary" sx={{ mt: 1 }}>
          You do not have permission to view this page.
        </Typography>
      </Container>
    );
  }

  return children;
};

export default ProtectedRoute;
