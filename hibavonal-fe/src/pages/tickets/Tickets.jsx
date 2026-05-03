import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import useAppStore from '../../store/useAppStore';
import useTickets from '../../api/hooks/useTickets';
import CreateTicketDialog from './CreateTicketDialog';
import EditStatusDialog from './EditStatusDialog';

const statusLabels = {
  in_progress: 'In progress',
  ready_to_done: 'Ready to done',
  done: 'Done',
};

function TicketItem({ ticket, canEditStatus, onEditStatus }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <ListItem
        secondaryAction={
          <>
            <IconButton edge="end" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVertIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
              {canEditStatus && (
                <MenuItem onClick={() => { setAnchorEl(null); onEditStatus(ticket); }}>
                  Edit status
                </MenuItem>
              )}
              <MenuItem onClick={() => setAnchorEl(null)}>Archive</MenuItem>
              <MenuItem onClick={() => setAnchorEl(null)}>Give feedback</MenuItem>
            </Menu>
          </>
        }
      >
        <ListItemText
          primary={ticket.ticketName}
          secondary={`Maintainer: ${ticket.maintainerName} | Room: ${ticket.roomName}`}
        />
      </ListItem>
    </>
  );
}

function TicketGroup({ title, tickets, canEditStatus, onEditStatus }) {
  if (!tickets.length) return null;
  return (
    <Card sx={{ mb: 3, width: '100%', maxWidth: 720, mx: 'auto' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">{title}</Typography>
          <Chip label={tickets.length} />
        </Stack>
        <Divider sx={{ mb: 1 }} />
        <List>
          {tickets.map((ticket) => (
            <TicketItem
              key={ticket.id}
              ticket={ticket}
              canEditStatus={canEditStatus}
              onEditStatus={onEditStatus}
            />
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

function mapTicket(t) {
  return {
    id: t.ticket_id,
    ticketName: t.details,
    maintainerName: t.maintainer_username || 'N/A',
    roomName: t.room_name || 'N/A',
    status: t.status,
  };
}

export default function Tickets() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTicket, setEditTicket] = useState(null);

  const { user } = useAppStore();
  const { tickets: raw, isLoading, error } = useTickets();

  const canEditStatus = user?.role === 'maintenance_manager' || user?.role === 'admin';
  const isStudent = user?.role === 'student';

  const tickets = useMemo(() => raw.map(mapTicket), [raw]);

  const groupedTickets = useMemo(() => ({
    in_progress: tickets.filter((t) => t.status === 'in_progress'),
    ready_to_done: tickets.filter((t) => t.status === 'ready_to_done'),
    done: tickets.filter((t) => t.status === 'done'),
  }), [tickets]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 720, mx: 'auto', py: 4 }}>
      <Box sx={{ width: '100%', px: 2 }}>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" fontWeight="bold">Tickets</Typography>
            {isStudent && (
              <Button
                variant="contained"
                color="error"
                startIcon={<AddIcon />}
                sx={{ borderRadius: 2 }}
                onClick={() => setCreateOpen(true)}
              >
                Create ticket
              </Button>
            )}
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          {!error && tickets.length === 0 ? (
            <Card sx={{ width: '100%', textAlign: 'center', py: 5 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>No tickets yet</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  There are no tickets related to this user yet.
                </Typography>
                {isStudent && (
                  <Button variant="contained" onClick={() => setCreateOpen(true)}>
                    Create one
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Box>
              <TicketGroup
                title={statusLabels.in_progress}
                tickets={groupedTickets.in_progress}
                canEditStatus={canEditStatus}
                onEditStatus={setEditTicket}
              />
              <TicketGroup
                title={statusLabels.ready_to_done}
                tickets={groupedTickets.ready_to_done}
                canEditStatus={canEditStatus}
                onEditStatus={setEditTicket}
              />
              <TicketGroup
                title={statusLabels.done}
                tickets={groupedTickets.done}
                canEditStatus={canEditStatus}
                onEditStatus={setEditTicket}
              />
            </Box>
          )}
        </Stack>
      </Box>

      <CreateTicketDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditStatusDialog
        open={!!editTicket}
        ticket={editTicket}
        onClose={() => setEditTicket(null)}
      />
    </Box>
  );
}
