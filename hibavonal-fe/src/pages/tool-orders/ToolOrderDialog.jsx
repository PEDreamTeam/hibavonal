import { useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import useTools from '../../api/hooks/useTools';
import useToolOrdersList from '../../api/hooks/useToolOrdersList';

export default function ToolOrderDialog({ open, onClose }) {
  const { tools, isLoading: toolsLoading } = useTools();
  const { createToolOrder } = useToolOrdersList();

  const [formData, setFormData] = useState({
    toolId: '',
    name: '',
    details: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createToolOrder({
        tool_id: Number(formData.toolId),
        name: formData.name,
        details: formData.details || undefined,
        status: 'ordered',
      });
      setFormData({ toolId: '', name: '', details: '' });
      onClose();
    } catch (err) {
      setError(
        err?.info?.error || err?.message || 'Failed to create tool order'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ toolId: '', name: '', details: '' });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Order a New Tool</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {toolsLoading ? (
            <CircularProgress size={24} />
          ) : (
            <TextField
              select
              label="Tool"
              name="toolId"
              value={formData.toolId}
              onChange={handleChange}
              fullWidth
              required
            >
              {tools.map((tool) => (
                <MenuItem key={tool.tool_id} value={tool.tool_id}>
                  {tool.name}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            label="Order name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Details"
            name="details"
            value={formData.details}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={3}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || !formData.toolId || !formData.name}
        >
          {submitting ? <CircularProgress size={20} /> : 'Create order'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
