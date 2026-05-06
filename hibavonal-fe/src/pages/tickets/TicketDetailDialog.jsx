import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import useAppStore from '../../store/useAppStore';
import useTicket from '../../api/hooks/useTicket';
import useTools from '../../api/hooks/useTools';
import useTickets from '../../api/hooks/useTickets';
import useTicketTypes from '../../api/hooks/useTicketTypes';
import useMaintainers from '../../api/hooks/useMaintainers';

const statusColors = {
  created: 'default',
  in_progress: 'warning',
  ready_to_done: 'info',
  done: 'success',
};

const statusLabels = {
  created: 'Created',
  in_progress: 'In progress',
  ready_to_done: 'Ready to done',
  done: 'Done',
};

function ToolAddButton({ ticketId, toolId, onSuccess, onError, disabled }) {
  const { addTool } = useTicket(ticketId);
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      await addTool(Number(toolId));
      onSuccess();
    } catch (err) {
      onError(err?.info?.error || err?.message || 'Failed to add tool');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="contained"
      size="small"
      onClick={handle}
      disabled={disabled || loading}
    >
      {loading ? <CircularProgress size={18} /> : 'Add'}
    </Button>
  );
}

function ToolRemoveButton({ ticketId, toolId, onError }) {
  const { removeTool } = useTicket(ticketId);
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      await removeTool(toolId);
    } catch (err) {
      onError(err?.info?.error || err?.message || 'Failed to remove tool');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IconButton edge="end" size="small" onClick={handle} disabled={loading}>
      {loading ? (
        <CircularProgress size={16} />
      ) : (
        <DeleteIcon fontSize="small" />
      )}
    </IconButton>
  );
}

export default function TicketDetailDialog({ open, ticketId, onClose }) {
  const { user } = useAppStore();
  const {
    ticket,
    isLoading,
    error,
    mutate: mutateTicket,
  } = useTicket(open ? ticketId : null);
  const { tools: allTools } = useTools();
  const { ticketTypes } = useTicketTypes();
  const { maintainers } = useMaintainers();
  const { updateTicketType, assignMaintainer } = useTickets();
  const [selectedToolId, setSelectedToolId] = useState('');
  const [actionError, setActionError] = useState(null);
  const [changingType, setChangingType] = useState(false);
  const [assigningMaintainer, setAssigningMaintainer] = useState(false);

  const isMaintainer = user?.role === 'maintainer';
  const canChangeTicketType =
    user?.role === 'maintainer' || user?.role === 'maintenance_manager';
  const canAssignMaintainer =
    user?.role === 'maintenance_manager' || user?.role === 'admin';

  const assignedToolIds = new Set((ticket?.tools || []).map((t) => t.tool_id));
  const availableTools = allTools.filter(
    (t) => !assignedToolIds.has(t.tool_id)
  );

  const handleTicketTypeChange = async (e) => {
    const newTypeId = Number(e.target.value);
    if (!newTypeId || newTypeId === ticket?.ticket_type_id) return;
    setChangingType(true);
    setActionError(null);
    try {
      await updateTicketType(ticketId, newTypeId);
    } catch (err) {
      setActionError(
        err?.info?.error || err?.message || 'Failed to update ticket type'
      );
    } finally {
      setChangingType(false);
    }
  };

  const handleMaintainerChange = async (e) => {
    const newMaintainerId =
      e.target.value === '' ? null : Number(e.target.value);
    if (newMaintainerId === ticket?.maintainer_id) return;
    setAssigningMaintainer(true);
    setActionError(null);
    try {
      await assignMaintainer(ticketId, newMaintainerId);
      await mutateTicket();
    } catch (err) {
      setActionError(
        err?.info?.error || err?.message || 'Failed to assign maintainer'
      );
    } finally {
      setAssigningMaintainer(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ticket Details</DialogTitle>
      <DialogContent>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {ticket && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Status:
              </Typography>
              <Chip
                label={statusLabels[ticket.status] || ticket.status}
                color={statusColors[ticket.status] || 'default'}
                size="small"
              />
            </Stack>
            <Typography variant="body2">
              <strong>Room:</strong> {ticket.room_name || 'N/A'}
            </Typography>
            {canChangeTicketType ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  select
                  label="Ticket type"
                  value={ticket.ticket_type_id || ''}
                  onChange={handleTicketTypeChange}
                  size="small"
                  sx={{ flex: 1 }}
                  disabled={changingType}
                >
                  {ticketTypes.map((tt) => (
                    <MenuItem key={tt.ticket_type_id} value={tt.ticket_type_id}>
                      {tt.name}
                    </MenuItem>
                  ))}
                </TextField>
                {changingType && <CircularProgress size={20} />}
              </Stack>
            ) : (
              <Typography variant="body2">
                <strong>Ticket type:</strong> {ticket.ticket_type_name || 'N/A'}
              </Typography>
            )}
            {canAssignMaintainer ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  select
                  label="Maintainer"
                  value={ticket.maintainer_id ?? ''}
                  onChange={handleMaintainerChange}
                  size="small"
                  sx={{ flex: 1 }}
                  disabled={assigningMaintainer}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {maintainers.map((m) => (
                    <MenuItem key={m.user_id} value={m.user_id}>
                      {m.username}
                    </MenuItem>
                  ))}
                </TextField>
                {assigningMaintainer && <CircularProgress size={20} />}
              </Stack>
            ) : (
              <Typography variant="body2">
                <strong>Maintainer:</strong>{' '}
                {ticket.maintainer_username || 'N/A'}
              </Typography>
            )}
            <Typography variant="body2">
              <strong>Student:</strong> {ticket.student_username || 'N/A'}
            </Typography>
            <Typography variant="body2">
              <strong>Priority:</strong> {ticket.priority}
            </Typography>
            <Typography variant="body2">
              <strong>Details:</strong> {ticket.details}
            </Typography>

            <Divider />

            <Typography variant="subtitle1" fontWeight="bold">
              Tools ({ticket.tools?.length || 0})
            </Typography>

            {actionError && (
              <Alert severity="error" onClose={() => setActionError(null)}>
                {actionError}
              </Alert>
            )}

            {ticket.tools?.length > 0 ? (
              <List dense disablePadding>
                {ticket.tools.map((tool) => (
                  <ListItem key={tool.tool_id} disableGutters>
                    <ListItemText primary={tool.name} />
                    {isMaintainer && (
                      <ListItemSecondaryAction>
                        <ToolRemoveButton
                          ticketId={ticketId}
                          toolId={tool.tool_id}
                          onError={setActionError}
                        />
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No tools assigned
              </Typography>
            )}

            {isMaintainer && availableTools.length > 0 && (
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  select
                  label="Add tool"
                  value={selectedToolId}
                  onChange={(e) => setSelectedToolId(e.target.value)}
                  size="small"
                  sx={{ flex: 1 }}
                >
                  {availableTools.map((t) => (
                    <MenuItem key={t.tool_id} value={t.tool_id}>
                      {t.name}
                    </MenuItem>
                  ))}
                </TextField>
                <ToolAddButton
                  ticketId={ticketId}
                  toolId={selectedToolId}
                  onSuccess={() => setSelectedToolId('')}
                  onError={setActionError}
                  disabled={!selectedToolId}
                />
              </Stack>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
