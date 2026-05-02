import { useState, useCallback } from 'react';

const useToolOrdersList = () => {
  const [toolOrders, setToolOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchToolOrders = useCallback(async (token) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:5000/tool-orders/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Insufficient permissions to view tool orders');
        }
        throw new Error(`Failed to fetch tool orders: ${response.status}`);
      }

      const data = await response.json();
      setToolOrders(data);
    } catch (err) {
      setError(err.message);
      setToolOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    toolOrders,
    loading,
    error,
    fetchToolOrders,
  };
};

export default useToolOrdersList;
