import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stack,
  Alert,
} from '@mui/material';

const rooms = ['101', '102', '103', '104', 'Auditorium'];

function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function Create() {
  const [room, setRoom] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!room || !description) {
      setError('Kérlek válassz szobát és írd le a hibát.');
      return;
    }

    const existingStudentId = localStorage.getItem('studentId');
    const studentId = existingStudentId || generateUuid();
    localStorage.setItem('studentId', studentId);

    setLoading(true);

    try {
      const response = await fetch('/tickets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room,
          description,
          studentId,
        }),
      });

      if (!response.ok) {
        const responseBody = await response.json().catch(() => null);
        throw new Error(responseBody?.message || 'Beküldés sikertelen');
      }

      setSuccess('A hiba sikeresen elküldve.');
      setRoom('');
      setDescription('');
    } catch (fetchError) {
      setError(fetchError.message || 'Beküldés közben hiba történt.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          py: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: '95vw',
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Hiba bejelentése
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <TextField
          select
          label="Válasszon szobát"
          value={room}
          onChange={(event) => setRoom(event.target.value)}
          required
        >
          {rooms.map((roomOption) => (
            <MenuItem key={roomOption} value={roomOption}>
              {roomOption}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Hiba részletei"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          multiline
          rows={4}
          required
        />

        <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate('/')}
            disabled={loading}
          >
            Mégsem
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Küldés...' : 'Küldés'}
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
