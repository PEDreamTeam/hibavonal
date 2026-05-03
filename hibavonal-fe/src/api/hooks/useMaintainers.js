import useSWR from 'swr';
import { fetcher } from '../fetcher';

const useMaintainers = () => {
  const { data, error, isLoading } = useSWR('/api/users/maintainers', fetcher);

  return {
    maintainers: data || [],
    isLoading,
    error: error?.message || null,
  };
};

export default useMaintainers;
