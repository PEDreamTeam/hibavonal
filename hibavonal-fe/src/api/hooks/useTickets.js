import useSWR from 'swr';
import { fetcher, apiPost, apiPut, apiDelete } from '../fetcher';

const useTickets = () => {
  const { data, error, isLoading, mutate } = useSWR('/api/tickets', fetcher);

  const createTicket = async (body) => {
    const ticket = await apiPost('/api/tickets', body);
    await mutate();
    return ticket;
  };

  const updateTicketStatus = async (ticketId, status) => {
    const ticket = await apiPut(`/api/tickets/${ticketId}/status`, { status });
    await mutate();
    return ticket;
  };

  const updateTicketType = async (ticketId, ticketTypeId) => {
    const ticket = await apiPut(`/api/tickets/${ticketId}/ticket-type`, {
      ticket_type_id: ticketTypeId,
    });
    await mutate();
    return ticket;
  };

  const assignMaintainer = async (ticketId, maintainerId) => {
    const ticket = await apiPut(`/api/tickets/${ticketId}/maintainer`, {
      maintainer_id: maintainerId,
    });
    await mutate();
    return ticket;
  };

  const archiveTicket = async (ticketId) => {
    await apiDelete(`/api/tickets/${ticketId}`);
    await mutate();
  };

  return {
    tickets: data || [],
    isLoading,
    error: error?.info?.error || error?.message || null,
    createTicket,
    updateTicketStatus,
    updateTicketType,
    assignMaintainer,
    archiveTicket,
  };
};

export default useTickets;
