import useSWR from 'swr';
import { fetcher, apiPut } from '../fetcher';

const useStudents = () => {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/users/students',
    fetcher
  );

  const assignRoom = async (userId, roomId) => {
    await apiPut(`/api/users/${userId}/room`, { room_id: roomId });
    await mutate();
  };

  return {
    students: data || [],
    isLoading,
    error: error?.message || null,
    assignRoom,
  };
};

export default useStudents;
