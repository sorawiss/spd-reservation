import { useState, useEffect, useRef } from 'react';
import { bookingsAPI } from '../services/api';
import { format } from 'date-fns';

export const useRealTimeBookings = ({
  date,
  enabled = true,
  interval = 10000 // 10 seconds default
}) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  // Format date for API call
  const formatDate = (date) => {
    return format(date, 'yyyy-MM-dd');
  };

  // Fetch bookings function
  const fetchBookings = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const formattedDate = formatDate(date);
      const data = await bookingsAPI.getBookings({ date: formattedDate });
      
      if (mountedRef.current) {
        setBookings(data.bookings || []);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      if (mountedRef.current) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch bookings');
      }
    } finally {
      if (mountedRef.current && showLoading) {
        setLoading(false);
      }
    }
  };

  // Start polling
  const startPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (enabled) {
      intervalRef.current = setInterval(() => {
        fetchBookings(false); // Don't show loading for background updates
      }, interval);
    }
  };

  // Stop polling
  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Manual refetch function
  const refetch = () => {
    fetchBookings(true);
  };

  // Effect for initial load and date changes
  useEffect(() => {
    mountedRef.current = true;
    fetchBookings(true);

    return () => {
      mountedRef.current = false;
    };
  }, [date]);

  // Effect for polling management
  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, interval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, []);

  // Handle visibility change to pause/resume polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else if (enabled) {
        fetchBookings(false); // Refresh when page becomes visible
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, interval]);

  return {
    bookings,
    loading,
    error,
    refetch
  };
}; 