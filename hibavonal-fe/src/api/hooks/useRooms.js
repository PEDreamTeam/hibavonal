import useSWR from 'swr';
import { fetcher, apiPost, apiPut, apiDelete } from '../fetcher';

const useRooms = () => {
  const { data, error, isLoading, mutate } = useSWR('/api/rooms', fetcher);

  const createRoom = async (body) => {
    const room = await apiPost('/api/rooms', body);
    await mutate();
    return room;
  };

  const updateRoom = async (roomId, body) => {
    const room = await apiPut(`/api/rooms/${roomId}`, body);
    await mutate();
    return room;
  };

  const deleteRoom = async (roomId) => {
    await apiDelete(`/api/rooms/${roomId}`);
    await mutate();
  };

  return {
    rooms: data || [],
    isLoading,
    error: error?.message || null,
    createRoom,
    updateRoom,
    deleteRoom,
  };
};

export default useRooms;
