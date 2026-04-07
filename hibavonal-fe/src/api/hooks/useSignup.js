import useSWRMutation from 'swr/mutation';
import { apiPost } from '../fetcher';

const signupFetcher = (url, { arg }) => apiPost(url, arg);

const useSignup = () => {
  const { trigger, isMutating, error, reset } = useSWRMutation(
    '/api/auth/signup',
    signupFetcher
  );

  return {
    signup: trigger,
    isLoading: isMutating,
    error: error?.message || null,
    resetError: reset,
  };
};

export default useSignup;
