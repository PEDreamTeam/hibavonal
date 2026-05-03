import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import useAppStore from '../../store/useAppStore';
import useToolOrdersList from '../../api/hooks/useToolOrdersList';
import ToolOrderDialog from './ToolOrderDialog';

const ToolOrdersList = () => {
  const { user } = useAppStore();
  const { toolOrders, isLoading, error } = useToolOrdersList();
  const [dialogOpen, setDialogOpen] = useState(false);

  const canOrderTool =
    user?.role === 'maintenance_manager' || user?.role === 'admin';

  const getStatusColor = (status) =>
    status === 'ordered' ? 'warning' : 'success';
  const getStatusLabel = (status) =>
    status === 'ordered' ? 'Ordered' : 'Ready';

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Typography variant="h4">Tool Orders</Typography>
          <Stack direction="row" spacing={1}>
            {canOrderTool && (
              <Button variant="contained" onClick={() => setDialogOpen(true)}>
                Order a new tool
              </Button>
            )}
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!error && toolOrders.length === 0 && (
          <Alert severity="info">No tool orders found</Alert>
        )}

        {!error && toolOrders.length > 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell>Tool Name</TableCell>
                  <TableCell>Order Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {toolOrders.map((order) => (
                  <TableRow key={order.tool_order_id}>
                    <TableCell>{order.tool_name || 'N/A'}</TableCell>
                    <TableCell>{order.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(order.status)}
                        color={getStatusColor(order.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{order.created_by || 'N/A'}</TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {order.details || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <ToolOrderDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Container>
  );
};

export default ToolOrdersList;
