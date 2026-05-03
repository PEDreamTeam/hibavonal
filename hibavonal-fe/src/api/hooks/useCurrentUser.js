import useSWR from 'swr';
import { fetcher } from '../fetcher';

const useCurrentUser = () => {
  const { data, error, isLoading } = useSWR('/api/auth/me', fetcher);

  return {
    currentUser: data?.user || null,
    isLoading,
    error: error?.message || null,
  };
};

export default useCurrentUser;
