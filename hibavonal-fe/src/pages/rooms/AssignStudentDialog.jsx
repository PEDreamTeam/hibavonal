import { useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import useStudents from '../../api/hooks/useStudents';

export default function AssignStudentDialog({ open, room, onClose }) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { students, assignRoom } = useStudents();

  const assigned = students.filter((s) => s.room_id === room?.room_id);
  const available = students.filter((s) => s.room_id !== room?.room_id);

  const handleAssign = async () => {
    if (!selectedUserId) return;
    setSubmitting(true);
    setError(null);
    try {
      await assignRoom(Number(selectedUserId), room.room_id);
      setSelectedUserId('');
    } catch (err) {
      setError(err.info?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (userId) => {
    setError(null);
    try {
      await assignRoom(userId, null);
    } catch (err) {
      setError(err.info?.error || err.message);
    }
  };

  const handleClose = () => {
    setSelectedUserId('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Students — {room?.name}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <Stack direction="row" spacing={1} alignItems="center">
            <FormControl fullWidth>
              <InputLabel>Add student</InputLabel>
              <Select
                value={selectedUserId}
                label="Add student"
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                {available.map((s) => (
                  <MenuItem key={s.user_id} value={s.user_id}>
                    {s.username}
                    {s.room_name ? ` (currently: ${s.room_name})` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleAssign}
              disabled={submitting || !selectedUserId}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Assign
            </Button>
          </Stack>

          <Divider />

          <Typography variant="subtitle2" color="text.secondary">
            Assigned students ({assigned.length})
          </Typography>

          {assigned.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No students assigned to this room yet.
            </Typography>
          ) : (
            <List dense disablePadding>
              {assigned.map((s) => (
                <ListItem
                  key={s.user_id}
                  secondaryAction={
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleRemove(s.user_id)}
                      disabled={submitting}
                    >
                      Remove
                    </Button>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ width: 30, height: 30 }}>
                      <PersonIcon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={s.username} secondary={s.email} />
                </ListItem>
              ))}
            </List>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
