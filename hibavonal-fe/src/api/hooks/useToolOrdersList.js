import useSWR from 'swr';
import { fetcher } from '../fetcher';

const useToolOrdersList = () => {
  const { data, error, isLoading } = useSWR('/tool-orders/list', fetcher);

  return {
    toolOrders: data || [],
    isLoading,
    error: error?.info?.error || error?.message || null,
  };
};

export default useToolOrdersList;
