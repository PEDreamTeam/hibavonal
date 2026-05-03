import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import useTickets from '../../api/hooks/useTickets';

const STATUS_OPTIONS = [
  { value: 'in_progress', label: 'In Progress' },
  { value: 'ready_to_done', label: 'Ready to Done' },
  { value: 'done', label: 'Done' },
];

export default function EditStatusDialog({ open, ticket, onClose }) {
  const [status, setStatus] = useState('in_progress');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { updateTicketStatus } = useTickets();

  useEffect(() => {
    if (ticket) setStatus(ticket.status);
  }, [ticket]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await updateTicketStatus(ticket.id, status);
      onClose();
    } catch (err) {
      setError(err.info?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Ticket Status</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
