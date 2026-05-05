import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Menu,
  MenuItem,
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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import useAppStore from '../../store/useAppStore';
import useToolOrdersList from '../../api/hooks/useToolOrdersList';
import ToolOrderDialog from './ToolOrderDialog';

const STATUS_OPTIONS = [
  { value: 'ordered', label: 'Ordered' },
  { value: 'ready', label: 'Ready' },
];

const ToolOrdersList = () => {
  const { user } = useAppStore();
  const { toolOrders, isLoading, error, updateToolOrderStatus } =
    useToolOrdersList();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const canOrderTool =
    user?.role === 'maintenance_manager' || user?.role === 'admin';
  const canChangeStatus = user?.role === 'admin';

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

  const handleMenuOpen = (event, order) => {
    setSelectedOrder(order);
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedOrder(null);
  };

  const handleStatusChange = async (status) => {
    if (!selectedOrder) return;
    await updateToolOrderStatus(selectedOrder.tool_order_id, status);
    handleMenuClose();
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
                  {canChangeStatus && <TableCell />}
                </TableRow>
              </TableHead>
              <TableBody>
                {toolOrders.map((order) => (
                  <TableRow
                    key={order.tool_order_id}
                  >
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
                    {canChangeStatus && (
                      <TableCell align="right" sx={{ py: 0 }}>
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, order)}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Menu
        open={Boolean(menuAnchor)}
        anchorEl={menuAnchor}
        onClose={handleMenuClose}
      >
        <Typography
          variant="caption"
          sx={{ px: 2, py: 0.5, display: 'block', color: 'text.secondary' }}
        >
          Set status
        </Typography>
        {STATUS_OPTIONS.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            selected={selectedOrder?.status === option.value}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>

      <ToolOrderDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Container>
  );
};

export default ToolOrdersList;
