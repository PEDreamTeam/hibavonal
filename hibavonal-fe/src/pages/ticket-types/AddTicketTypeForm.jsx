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

export default function AddTicketTypeForm() {
  const [formData, setFormData] = useState({
    name: '',
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
    console.log('New ticket type submitted:', formData);
    alert('Ticket type submitted successfully');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 3 }}>
              Add New Ticket Type
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Ticket type name"
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
                  minRows={4}
                />

                <Stack direction="row" justifyContent="flex-end">
                  <Button type="submit" variant="contained">
                    Add ticket type
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
