import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

const mockTools = [
  { id: 1, name: 'Drill' },
  { id: 2, name: 'Hammer' },
  { id: 3, name: 'Screwdriver set' },
];

export default function ToolOrderForm() {
  const [formData, setFormData] = useState({
    toolId: '',
    name: '',
    details: '',
    status: 'ordered',
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
    console.log('Tool order form submitted:', formData);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 3 }}>
              Create Tool Order
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  select
                  label="Tool"
                  name="toolId"
                  value={formData.toolId}
                  onChange={handleChange}
                  fullWidth
                  required
                >
                  {mockTools.map((tool) => (
                    <MenuItem key={tool.id} value={tool.id}>
                      {tool.name}
                    </MenuItem>
                  ))}
                </TextField>

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
                  minRows={4}
                />

                <TextField
                  select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  fullWidth
                  required
                >
                  <MenuItem value="ordered">Ordered</MenuItem>
                  <MenuItem value="ready">Ready</MenuItem>
                </TextField>

                <Stack direction="row" justifyContent="flex-end">
                  <Button type="submit" variant="contained">
                    Create tool order
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
