import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

export default function StudentFeedbackForm() {
  const [formData, setFormData] = useState({
    ticketId: '',
    details: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Student feedback submitted:', formData);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 3 }}>
              Write Feedback
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Ticket ID"
                  name="ticketId"
                  value={formData.ticketId}
                  onChange={handleChange}
                  fullWidth
                  required
                />

                <TextField
                  label="Feedback"
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={5}
                  required
                />

                <Stack direction="row" justifyContent="flex-end">
                  <Button type="submit" variant="contained">
                    Submit feedback
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
