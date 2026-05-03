import { useState } from 'react';
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
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import useTickets from '../../api/hooks/useTickets';
import useRooms from '../../api/hooks/useRooms';
import useCurrentUser from '../../api/hooks/useCurrentUser';
import useAppStore from '../../store/useAppStore';

export default function CreateTicketDialog({ open, onClose }) {
  const [form, setForm] = useState({
    room_id: '',
    details: '',
    priority: 3,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { createTicket } = useTickets();
  const { rooms: allRooms } = useRooms();
  const { currentUser } = useCurrentUser();
  const { user } = useAppStore();

  const rooms = user?.role === 'student' && currentUser?.room_id
    ? allRooms.filter((r) => r.room_id === currentUser.room_id)
    : allRooms;

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await createTicket({
        room_id: Number(form.room_id),
        details: form.details,
        priority: form.priority,
      });
      handleClose();
    } catch (err) {
      setError(err.info?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm({ room_id: '', details: '', priority: 3 });
    setError(null);
    onClose();
  };

  const isValid = form.room_id && form.details.trim();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Ticket</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <FormControl fullWidth>
            <InputLabel>Room</InputLabel>
            <Select value={form.room_id} label="Room" onChange={set('room_id')}>
              {rooms.map((r) => (
                <MenuItem key={r.room_id} value={r.room_id}>
                  {r.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Details"
            multiline
            rows={3}
            value={form.details}
            onChange={set('details')}
            fullWidth
          />

          <Stack spacing={1}>
            <Typography variant="body2">Priority: {form.priority}</Typography>
            <Slider
              value={form.priority}
              min={0}
              max={5}
              step={1}
              marks
              onChange={(_, val) => setForm((f) => ({ ...f, priority: val }))}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || !isValid}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
