'use client';

import { useState, useEffect, useRef } from 'react';
import { Booking } from '../types';

interface UseRealTimeBookingsProps {
  date: Date;
  enabled?: boolean;
  interval?: number; // Polling interval in milliseconds
}

interface UseRealTimeBookingsReturn {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useRealTimeBookings = ({
  date,
  enabled = true,
  interval = 10000 // 10 seconds default
}: UseRealTimeBookingsProps): UseRealTimeBookingsReturn => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Format date for API call
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Fetch bookings function
  const fetchBookings = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const formattedDate = formatDate(date);
      const response = await fetch(`/api/bookings?date=${formattedDate}`, {
        cache: 'no-store', // Ensure fresh data
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      
      if (mountedRef.current) {
        setBookings(data.bookings || []);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
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