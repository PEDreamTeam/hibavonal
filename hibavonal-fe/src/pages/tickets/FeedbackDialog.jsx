import { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useAppStore from '../../store/useAppStore';
import useTicket from '../../api/hooks/useTicket';
import useStudentFeedback from '../../api/hooks/useStudentFeedback';

export default function FeedbackDialog({ open, ticketId, onClose }) {
  const { user } = useAppStore();
  const { ticket, isLoading, error, mutate } = useTicket(
    open ? ticketId : null
  );
  const { createFeedback } = useStudentFeedback();
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const isStudent = user?.role === 'student';
  const feedback = ticket?.feedback;
  const canSubmit =
    isStudent && ticket?.student_id === user?.user_id && !feedback;

  const handleSubmit = async () => {
    if (!details.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createFeedback(ticketId, details.trim());
      setDetails('');
      await mutate();
    } catch (err) {
      setSubmitError(
        err?.info?.error || err?.message || 'Failed to submit feedback'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setDetails('');
    setSubmitError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Feedbacks</DialogTitle>
      <DialogContent>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {ticket && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            {feedback ? (
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="body2" fontWeight="bold">
                    Feedback by {ticket.student_username || 'Student'}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2">{feedback.details}</Typography>
                </AccordionDetails>
              </Accordion>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No feedback submitted yet.
              </Typography>
            )}

            {canSubmit && (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Submit feedback</Typography>
                {submitError && (
                  <Alert severity="error" onClose={() => setSubmitError(null)}>
                    {submitError}
                  </Alert>
                )}
                <TextField
                  multiline
                  minRows={3}
                  fullWidth
                  label="Your feedback"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  disabled={submitting}
                />
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!details.trim() || submitting}
                  sx={{ alignSelf: 'flex-end' }}
                >
                  {submitting ? <CircularProgress size={20} /> : 'Submit'}
                </Button>
              </Stack>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
