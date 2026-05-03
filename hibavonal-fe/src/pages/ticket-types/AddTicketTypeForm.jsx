import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../../api/fetcher';
import useTools from '../../api/hooks/useTools';

export default function AddTicketTypeForm() {
  const navigate = useNavigate();
  const { tools, isLoading: toolsLoading } = useTools();

  const [formData, setFormData] = useState({ name: '', details: '' });
  const [selectedToolIds, setSelectedToolIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToolToggle = (toolId) => {
    setSelectedToolIds((prev) =>
      prev.includes(toolId)
        ? prev.filter((id) => id !== toolId)
        : [...prev, toolId]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiPost('/api/ticket-types', {
        name: formData.name,
        details: formData.details || undefined,
        tool_ids: selectedToolIds,
      });
      navigate('/tools');
    } catch (err) {
      setError(
        err?.info?.error || err?.message || 'Failed to create ticket type'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 3 }}>
              Add New Ticket Type
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

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

                {toolsLoading ? (
                  <CircularProgress size={24} />
                ) : tools.length > 0 ? (
                  <Box>
                    <FormLabel component="legend" sx={{ mb: 1 }}>
                      Assign tools
                    </FormLabel>
                    <FormGroup>
                      {tools.map((tool) => (
                        <FormControlLabel
                          key={tool.tool_id}
                          control={
                            <Checkbox
                              checked={selectedToolIds.includes(tool.tool_id)}
                              onChange={() => handleToolToggle(tool.tool_id)}
                            />
                          }
                          label={tool.name}
                        />
                      ))}
                    </FormGroup>
                  </Box>
                ) : null}

                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting || !formData.name.trim()}
                  >
                    {submitting ? (
                      <CircularProgress size={20} />
                    ) : (
                      'Add ticket type'
                    )}
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
