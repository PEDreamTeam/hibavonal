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

export default function AddToolForm() {
  const [formData, setFormData] = useState({
    name: '',
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
    console.log('New tool submitted:', formData);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 3 }}>
              Add New Tool
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Tool name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                />

                <Stack direction="row" justifyContent="flex-end">
                  <Button type="submit" variant="contained">
                    Add tool
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
