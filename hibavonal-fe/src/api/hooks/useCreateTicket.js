import { useState } from 'react';

/**
 * Custom hook for creating a ticket
 * Uses fetch with proper error handling
 * TODO: Upgrade to SWR when library is installed
 * 
 * @returns {Object} - { data, error, isLoading, execute }
 */
export function useCreateTicket() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = async (ticketData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/tickets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to create ticket';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    data, 
    error, 
    isLoading, 
    execute 
  };
}

// TODO: SWR implementation (when library is installed)
// import useSWR from 'swr';
// 
// const fetcher = async (url, options) => {
//   const response = await fetch(url, {
//     method: options.method || 'GET',
//     headers: options.headers || { 'Content-Type': 'application/json' },
//     body: options.body ? JSON.stringify(options.body) : undefined,
//   });
//   
//   if (!response.ok) {
//     throw new Error(`HTTP error! status: ${response.status}`);
//   }
//   
//   return response.json();
// };
//
// export function useCreateTicket() {
//   const { data, error, isValidating, mutate } = useSWR(
//     ['/tickets/create', { method: 'POST' }],
//     ([url, options]) => fetcher(url, options),
//     { revalidateOnFocus: false }
//   );
//
//   const execute = async (ticketData) => {
//     return mutate(
//       fetcher('/tickets/create', {
//         method: 'POST',
//         body: ticketData,
//       })
//     );
//   };
//
//   return {
//     data,
//     error,
//     isLoading: isValidating,
//     execute,
//   };
// }
