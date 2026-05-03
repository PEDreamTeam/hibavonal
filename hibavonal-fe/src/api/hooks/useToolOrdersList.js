import useSWR from 'swr';
import { fetcher, apiPost } from '../fetcher';

const useToolOrdersList = () => {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/tool-orders/list',
    fetcher
  );

  const createToolOrder = async (body) => {
    const order = await apiPost('/api/tool-orders', body);
    await mutate();
    return order;
  };

  return {
    toolOrders: data || [],
    isLoading,
    error: error?.info?.error || error?.message || null,
    createToolOrder,
  };
};

export default useToolOrdersList;
