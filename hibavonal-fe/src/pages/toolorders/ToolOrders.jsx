import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import useAppStore from '../../store/useAppStore';

export default function ToolOrders() {
  const { user, getToolOrders, createToolOrder, updateToolOrder, loading, error } = useAppStore();
  const [orders, setOrders] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    tool_name: '',
    quantity: 1,
    reason: '',
  });
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setFetchError('');
      const data = await getToolOrders();
      setOrders(data);
    } catch (error) {
      setFetchError(error.message);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ tool_name: '', quantity: 1, reason: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'quantity' ? parseInt(value) || 1 : value,
    });
  };

  const handleSubmit = async () => {
    if (!formData.tool_name.trim()) {
      setFetchError('A szerszám neve kötelező');
      return;
    }

    try {
      setFetchError('');
      await createToolOrder(formData.tool_name, formData.quantity, formData.reason);
      handleCloseDialog();
      await loadOrders();
    } catch (error) {
      setFetchError(error.message);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setFetchError('');
      await updateToolOrder(orderId, newStatus);
      await loadOrders();
    } catch (error) {
      setFetchError(error.message);
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'info';
      case 'completed':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const statusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Függőben';
      case 'approved':
        return 'Jóváhagyva';
      case 'completed':
        return 'Befejezve';
      case 'rejected':
        return 'Elutasítva';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <h1>Szerszámrendelési lista</h1>
        {user && user.role === 'maintenance' && (
          <Button variant="contained" color="primary" onClick={handleOpenDialog} sx={{ mt: 2 }}>
            Új megrendelés
          </Button>
        )}
      </Box>

      {(fetchError || error) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {fetchError || error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Szerszám neve</strong></TableCell>
              <TableCell align="center"><strong>Mennyiség</strong></TableCell>
              <TableCell><strong>Létrehozta</strong></TableCell>
              <TableCell><strong>Dátum</strong></TableCell>
              <TableCell align="center"><strong>Állapot</strong></TableCell>
              {user && user.role === 'admin' && <TableCell align="center"><strong>Kezelés</strong></TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={user?.role === 'admin' ? 6 : 5} align="center" sx={{ py: 3 }}>
                  Nincs megrendelés
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>{order.tool_name}</TableCell>
                  <TableCell align="center">{order.quantity}</TableCell>
                  <TableCell>{order.created_by}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString('hu-HU')}</TableCell>
                  <TableCell align="center">
                    {user?.role === 'admin' ? (
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <Select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                          <MenuItem value="pending">Függőben</MenuItem>
                          <MenuItem value="approved">Jóváhagyva</MenuItem>
                          <MenuItem value="rejected">Elutasítva</MenuItem>
                          <MenuItem value="completed">Befejezve</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip label={statusLabel(order.status)} color={statusColor(order.status)} />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Új szerszám megrendelés</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Szerszám neve"
            name="tool_name"
            value={formData.tool_name}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Mennyiség"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleInputChange}
            margin="normal"
            inputProps={{ min: 1 }}
          />
          <TextField
            fullWidth
            label="Indoklás"
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Mégsem</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Létrehozás
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
