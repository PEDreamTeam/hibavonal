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

