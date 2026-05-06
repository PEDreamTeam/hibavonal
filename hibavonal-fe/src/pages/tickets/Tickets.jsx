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
import TicketDetailDialog from './TicketDetailDialog';
import FeedbackDialog from './FeedbackDialog';

const statusLabels = {
  created: 'Created',
  in_progress: 'In progress',
  ready_to_done: 'Ready to done',
  done: 'Done',
};

function TicketItem({
  ticket,
  isStudent,
  statusAction,
  onMarkStatus,
  onViewDetails,
  onShowFeedbacks,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const close = () => setAnchorEl(null);

  const STATUS_ORDER = ['created', 'in_progress', 'ready_to_done', 'done'];
  const showStatusAction =
    statusAction &&
    STATUS_ORDER.indexOf(ticket.status) <
      STATUS_ORDER.indexOf(statusAction.status);

  return (
    <ListItem
      secondaryAction={
        <>
          <IconButton edge="end" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <MoreVertIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={close}>
            <MenuItem
              onClick={() => {
                close();
                onViewDetails(ticket);
              }}
            >
              View details
            </MenuItem>
            {showStatusAction && (
              <MenuItem
                onClick={() => {
                  close();
                  onMarkStatus(ticket, statusAction.status);
                }}
              >
                {statusAction.label}
              </MenuItem>
            )}
            <MenuItem
              onClick={() => {
                close();
                onShowFeedbacks(ticket);
              }}
            >
              Show feedbacks
            </MenuItem>
            {isStudent && (
              <MenuItem
                onClick={() => {
                  close();
                  onShowFeedbacks(ticket);
                }}
              >
                Give feedback
              </MenuItem>
            )}
            {!isStudent && <MenuItem onClick={close}>Archive</MenuItem>}
          </Menu>
        </>
      }
    >
      <ListItemText
        primary={ticket.ticketName}
        secondary={`Maintainer: ${ticket.maintainerName} | Room: ${ticket.roomName}`}
      />
    </ListItem>
  );
}

function TicketGroup({
  title,
  tickets,
  isStudent,
  statusAction,
  onMarkStatus,
  onViewDetails,
  onShowFeedbacks,
}) {
  if (!tickets.length) return null;
  return (
    <Card sx={{ mb: 3, width: '100%', maxWidth: 720, mx: 'auto' }}>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6">{title}</Typography>
          <Chip label={tickets.length} />
        </Stack>
        <Divider sx={{ mb: 1 }} />
        <List>
          {tickets.map((ticket) => (
            <TicketItem
              key={ticket.id}
              ticket={ticket}
              isStudent={isStudent}
              statusAction={statusAction}
              onMarkStatus={onMarkStatus}
              onViewDetails={onViewDetails}
              onShowFeedbacks={onShowFeedbacks}
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
  const [detailTicketId, setDetailTicketId] = useState(null);
  const [feedbackTicketId, setFeedbackTicketId] = useState(null);
  const [statusError, setStatusError] = useState(null);

  const { user } = useAppStore();
  const { tickets: raw, isLoading, error, updateTicketStatus } = useTickets();

  const isStudent = user?.role === 'student';

  const statusAction = useMemo(() => {
    if (user?.role === 'maintainer')
      return { label: 'Mark as ready to done', status: 'ready_to_done' };
    if (user?.role === 'maintenance_manager' || user?.role === 'admin')
      return { label: 'Mark as done', status: 'done' };
    return null;
  }, [user?.role]);

  const handleMarkStatus = async (ticket, status) => {
    setStatusError(null);
    try {
      await updateTicketStatus(ticket.id, status);
    } catch (err) {
      setStatusError(
        err?.info?.error || err?.message || 'Failed to update status'
      );
    }
  };

  const tickets = useMemo(() => raw.map(mapTicket), [raw]);

  const groupedTickets = useMemo(
    () => ({
      created: tickets.filter((t) => t.status === 'created'),
      in_progress: tickets.filter((t) => t.status === 'in_progress'),
      ready_to_done: tickets.filter((t) => t.status === 'ready_to_done'),
      done: tickets.filter((t) => t.status === 'done'),
    }),
    [tickets]
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const groupProps = {
    isStudent,
    statusAction,
    onMarkStatus: handleMarkStatus,
    onViewDetails: (t) => setDetailTicketId(t.id),
    onShowFeedbacks: (t) => setFeedbackTicketId(t.id),
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: 720,
        mx: 'auto',
        py: 4,
      }}
    >
      <Box sx={{ width: '100%', px: 2 }}>
        <Stack spacing={3}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h4" fontWeight="bold">
              Tickets
            </Typography>
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

          {(error || statusError) && (
            <Alert
              severity="error"
              onClose={statusError ? () => setStatusError(null) : undefined}
            >
              {error || statusError}
            </Alert>
          )}

          {!error && tickets.length === 0 ? (
            <Card sx={{ width: '100%', textAlign: 'center', py: 5 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  No tickets yet
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  There are no tickets related to this user yet.
                </Typography>
                {isStudent && (
                  <Button
                    variant="contained"
                    onClick={() => setCreateOpen(true)}
                  >
                    Create one
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Box>
              <TicketGroup
                title={statusLabels.created}
                tickets={groupedTickets.created}
                {...groupProps}
              />
              <TicketGroup
                title={statusLabels.in_progress}
                tickets={groupedTickets.in_progress}
                {...groupProps}
              />
              <TicketGroup
                title={statusLabels.ready_to_done}
                tickets={groupedTickets.ready_to_done}
                {...groupProps}
              />
              <TicketGroup
                title={statusLabels.done}
                tickets={groupedTickets.done}
                {...groupProps}
              />
            </Box>
          )}
        </Stack>
      </Box>

      <CreateTicketDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <TicketDetailDialog
        open={!!detailTicketId}
        ticketId={detailTicketId}
        onClose={() => setDetailTicketId(null)}
      />
      <FeedbackDialog
        open={!!feedbackTicketId}
        ticketId={feedbackTicketId}
        onClose={() => setFeedbackTicketId(null)}
      />
    </Box>
  );
}
