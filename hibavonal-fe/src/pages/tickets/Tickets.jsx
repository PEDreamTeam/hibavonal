import { useMemo, useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    Typography,
    Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const mockTickets = [
    {
        id: 1,
        ticketName: 'Broken lamp',
        maintainerName: 'John Doe',
        roomName: 'A102',
        date: '2026-04-03',
        status: 'in_progress',
    },
    {
        id: 2,
        ticketName: 'Window issue',
        maintainerName: 'Jane Smith',
        roomName: 'B210',
        date: '2026-04-02',
        status: 'ready_to_done',
    },
    {
        id: 3,
        ticketName: 'Heating problem',
        maintainerName: 'John Doe',
        roomName: 'C011',
        date: '2026-04-01',
        status: 'done',
    },
];



const statusLabels = {
    in_progress: 'In progress',
    ready_to_done: 'Ready to done',
    done: 'Done',
};

const TicketItem = ({ ticket }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <ListItem
                secondaryAction={
                    <>
                        <IconButton edge="end" onClick={handleMenuOpen}>
                            <MoreVertIcon />
                        </IconButton>
                        <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
                            <MenuItem onClick={handleMenuClose}>Edit</MenuItem>
                            <MenuItem onClick={handleMenuClose}>Archive</MenuItem>
                            <MenuItem onClick={handleMenuClose}>Give feedback</MenuItem>
                        </Menu>
                    </>
                }
            >
                <ListItemText
                    primary={ticket.ticketName}
                    secondary={`Maintainer: ${ticket.maintainerName} | Room: ${ticket.roomName} | Date: ${ticket.date}`}
                />
            </ListItem>
        </>
    );
}

function TicketRow({ ticket }) {
    return (
        <ListItem>
            <ListItemText
                primary={ticket.ticketName}
                secondary={`Maintainer: ${ticket.maintainerName} | Room: ${ticket.roomName} | Date: ${ticket.date}`}
            />
        </ListItem>
    );
}

function TicketGroup({ title, tickets }) {
    if (!tickets.length) return null;

    return (
       <Card
             sx={{
                mb: 3,
                width: '100%',
                maxWidth: 720,
                mx: 'auto',
                }}
                >
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
                        <TicketRow key={ticket.id} ticket={ticket} />
                    ))}
                </List>
            </CardContent>
        </Card>
    );
}

export default function Tickets() {
    const tickets = mockTickets;

    const groupedTickets = useMemo(() => {
        return {
            in_progress: tickets.filter((ticket) => ticket.status === 'in_progress'),
            ready_to_done: tickets.filter((ticket) => ticket.status === 'ready_to_done'),
            done: tickets.filter((ticket) => ticket.status === 'done'),
        };
    }, [tickets]);

    const hasTickets = tickets.length > 0;

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                width: '100%',
                maxWidth: 720,
                mx: 'auto',
                py: 4,
                backgroundColor: '#fafafa'
            }}
        >
           
            <Box sx={{ width: '100%', px: 2 }}>
                <Stack spacing={3}>
                    
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Typography variant="h4" fontWeight="bold">Tickets</Typography>
                        <Button 
                            variant="contained" 
                            color="error" 
                            startIcon={<AddIcon />}
                            sx={{ borderRadius: 2 }}
                        >
                            Create ticket
                        </Button>
                    </Stack>

                    {!hasTickets ? (
                        <Card sx={{ width: '100%', textAlign: 'center', py: 5 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>No tickets yet</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    There are no tickets related to this user yet.
                                </Typography>
                                <Button variant="contained">Create one</Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Box>
                            <TicketGroup
                                title={statusLabels.in_progress}
                                tickets={groupedTickets.in_progress}
                            />
                            <TicketGroup
                                title={statusLabels.ready_to_done}
                                tickets={groupedTickets.ready_to_done}
                            />
                            <TicketGroup 
                                title={statusLabels.done} 
                                tickets={groupedTickets.done} 
                            />
                        </Box>
                    )}
                </Stack>
            </Box>
        </Box>
    );
}