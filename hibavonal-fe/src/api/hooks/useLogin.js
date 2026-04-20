import useSWRMutation from 'swr/mutation';
import { apiPost } from '../fetcher';

const loginFetcher = (url, { arg }) => apiPost(url, arg);

const useLogin = () => {
  const { trigger, isMutating, error, reset } = useSWRMutation(
    '/api/auth/login',
    loginFetcher
  );

  return {
    login: trigger,
    isLoading: isMutating,
    error: error?.message || null,
    resetError: reset,
  };
};

export default useLogin;
