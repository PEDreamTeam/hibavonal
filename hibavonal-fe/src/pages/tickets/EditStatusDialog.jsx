import { useEffect, useMemo, useState } from 'react';
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

const STATUS_OPTIONS_MAINTAINER = [
  { value: 'ready_to_done', label: 'Ready to Done' },
];

const STATUS_OPTIONS_MANAGER = [{ value: 'done', label: 'Done' }];

export default function EditStatusDialog({ open, ticket, userRole, onClose }) {
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { updateTicketStatus } = useTickets();

  const statusOptions = useMemo(
    () =>
      userRole === 'maintainer' ? STATUS_OPTIONS_MAINTAINER : STATUS_OPTIONS_MANAGER,
    [userRole]
  );

  useEffect(() => {
    if (ticket && statusOptions.length > 0) {
      setStatus(statusOptions[0].value);
    }
  }, [ticket, statusOptions]);

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
              {statusOptions.map((opt) => (
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
