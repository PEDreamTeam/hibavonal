import useSWR from 'swr';

export function useUser(userId) {
  //ha nincs userId az swr nem indít kérést
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/api/users/${userId}` : null
  );

  return {
    user: data,
    isLoading,
    isError: error,
    mutate,
  };
}
