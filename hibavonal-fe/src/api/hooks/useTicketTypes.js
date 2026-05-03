import useSWR from 'swr';
import { fetcher } from '../fetcher';

const useTicketTypes = () => {
  const { data, error, isLoading } = useSWR('/api/ticket-types', fetcher);

  return {
    ticketTypes: data || [],
    isLoading,
    error: error?.message || null,
  };
};

export default useTicketTypes;
