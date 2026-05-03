import useSWR from 'swr';
import { fetcher, apiPost } from '../fetcher';

const useTools = () => {
  const { data, error, isLoading, mutate } = useSWR('/api/tools', fetcher);

  const createTool = async (body) => {
    const tool = await apiPost('/api/tools', body);
    await mutate();
    return tool;
  };

  return {
    tools: data || [],
    isLoading,
    error: error?.info?.error || error?.message || null,
    createTool,
  };
};

export default useTools;
