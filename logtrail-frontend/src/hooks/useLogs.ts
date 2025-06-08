import { useState, useEffect, useCallback } from 'react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'error' | 'warning' | 'debug';
  message: string;
  userId?: string;
}

interface UseLogsOptions {
  limit?: number;
  userId?: string;
  levels?: string[];
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseLogsReturn {
  logs: LogEntry[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const useLogs = (options: UseLogsOptions = {}): UseLogsReturn => {
  const {
    limit = 100,
    userId,
    levels,
    autoRefresh = true,
    refreshInterval = 5000 // 5 seconds
  } = options;

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      
      if (userId) {
        params.append('userId', userId);
      }
      
      if (levels && levels.length > 0) {
        params.append('levels', levels.join(','));
      }
      
      const response = await fetch(`${API_BASE_URL}/logs/recent?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.status} ${response.statusText}`);
      }
      
      const data: LogEntry[] = await response.json();
      
      // Generate unique timestamp for this fetch to avoid key collisions
      const fetchTimestamp = Date.now();
      
      // Validate and format the data with guaranteed unique IDs
      const formattedLogs = data.map((log, index) => {
        // Always prefer backend-generated ID if available
        let uniqueId = log.id;
        
        // Only generate fallback ID if backend didn't provide one
        if (!uniqueId) {
          // Create a more robust fallback ID using multiple unique factors
          const timestamp = log.timestamp || new Date().toISOString();
          const message = (log.message || '').substring(0, 50); // First 50 chars of message
          const userId = log.userId || 'unknown';
          const level = log.level || 'info';
          const randomSuffix = Math.random().toString(36).substr(2, 12); // Longer random string
          
          // Create a unique string combining all available unique data
          const uniqueString = `${fetchTimestamp}_${index}_${timestamp}_${userId}_${level}_${message}_${randomSuffix}`;
          
          // Generate ID from hash to ensure consistency and uniqueness
          uniqueId = `log_${Math.abs(uniqueString.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0))}_${randomSuffix}`;
        }
        
        return {
          id: uniqueId,
          timestamp: log.timestamp || new Date().toLocaleTimeString(),
          level: log.level || 'info',
          message: log.message || 'No message',
          userId: log.userId
        };
      });
      
      setLogs(formattedLogs);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  }, [limit, userId, levels]);

  // Initial fetch
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchLogs();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchLogs, autoRefresh, refreshInterval]);

  const refetch = useCallback(() => {
    setLoading(true);
    fetchLogs();
  }, [fetchLogs]);

  return { 
    logs, 
    loading, 
    error, 
    refetch 
  };
};