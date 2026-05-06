import useSWR from 'swr';
import { fetcher, apiPost, apiDelete } from '../fetcher';

const useTicket = (ticketId) => {
  const { data, error, isLoading, mutate } = useSWR(
    ticketId ? `/api/tickets/${ticketId}` : null,
    fetcher
  );

  const addTool = async (toolId) => {
    const result = await apiPost(
      `/api/tickets/${ticketId}/tools/${toolId}`,
      {}
    );
    await mutate();
    return result;
  };

  const removeTool = async (toolId) => {
    const result = await apiDelete(`/api/tickets/${ticketId}/tools/${toolId}`);
    await mutate();
    return result;
  };

  return {
    ticket: data || null,
    isLoading,
    error: error?.info?.error || error?.message || null,
    addTool,
    removeTool,
    mutate,
  };
};

export default useTicket;
