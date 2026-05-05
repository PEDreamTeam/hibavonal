import useSWR from 'swr';
import { fetcher, apiPost, apiPut } from '../fetcher';

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

  const updateToolOrderStatus = async (toolOrderId, status) => {
    const result = await apiPut(`/api/tool-orders/${toolOrderId}`, { status });
    await mutate();
    return result;
  };

  return {
    toolOrders: data || [],
    isLoading,
    error: error?.info?.error || error?.message || null,
    createToolOrder,
    updateToolOrderStatus,
  };
};

export default useToolOrdersList;
