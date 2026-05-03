import useSWR from 'swr';
import { fetcher, apiPost } from '../fetcher';

const useTicketTypes = () => {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/ticket-types',
    fetcher
  );

  const createTicketType = (payload) => apiPost('/api/ticket-types', payload);

  return {
    ticketTypes: data || [],
    isLoading,
    error: error?.message || null,
    createTicketType,
    mutate,
  };
};

export default useTicketTypes;
