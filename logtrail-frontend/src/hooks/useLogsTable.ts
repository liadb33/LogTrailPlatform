import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Backend API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Stable empty filters object to prevent recreating on every render
const EMPTY_FILTERS: LogsTableFilters = {};

export interface LogItem {
  id: string;
  timestamp: string;
  userId: string;
  level: string;
  tag: string;
  message: string;
  system: string;
  threadId?: string;
  processId?: string;
  packageName?: string;
}

export interface LogsTableFilters {
  levels?: string[];
  tags?: string[];
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface UseLogsTableOptions {
  page?: number;
  limit?: number;
  filters?: LogsTableFilters;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseLogsTableReturn {
  logs: LogItem[];
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  setPage: (page: number) => void;
  setFilters: (filters: LogsTableFilters) => void;
  clearFilters: () => void;
}

export const useLogsTable = (options: UseLogsTableOptions = {}): UseLogsTableReturn => {
  const {
    page: initialPage = 1,
    limit = 10,
    filters: initialFilters = EMPTY_FILTERS,
    autoRefresh = false,
    refreshInterval = 10000, // 10 seconds default
  } = options;

  const [logs, setLogs] = useState<LogItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(initialPage);
  const [filters, setFilters] = useState<LogsTableFilters>(initialFilters);

  // Use ref to track if component is mounted to prevent state updates after unmount
  const mountedRef = useRef(true);
  const fetchCountRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true; 
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Create a stable string representation of filters for comparison
  const filtersString = useMemo(() => {
    return JSON.stringify({
      levels: filters.levels?.sort() || [],
      tags: filters.tags?.sort() || [],
      userId: filters.userId || "",
      startDate: filters.startDate || "",
      endDate: filters.endDate || "",
      search: filters.search || "",
    });
  }, [filters]);

  const fetchLogs = useCallback(
    async (signal?: AbortSignal) => {
      if (!mountedRef.current) return;

      fetchCountRef.current += 1;
      const fetchId = fetchCountRef.current;

      console.log(`🔄 fetchLogs called (#${fetchId}) with:`, {
        page,
        limit,
        filters,
      });

      setLoading(true);
      setError(null);

      // Declare timeout variables outside try block for proper scope
      let timeoutId: number | undefined;
      let timeoutController: AbortController | undefined;

      try {
        // Build query parameters
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());

        if (filters.levels && filters.levels.length > 0) {
          params.append("levels", filters.levels.join(","));
        }

        if (filters.tags && filters.tags.length > 0) {
          params.append("tags", filters.tags.join(","));
        }

        if (filters.userId && filters.userId.trim()) {
          params.append("userId", filters.userId.trim());
        }

        if (filters.search && filters.search.trim()) {
          params.append("search", filters.search.trim());
        }

        if (filters.startDate) {
          params.append("startDate", filters.startDate);
        }

        if (filters.endDate) {
          params.append("endDate", filters.endDate);
        }

        const url = `${API_BASE_URL}/logs/table?${params.toString()}`;
        console.log(`📡 Making API call (#${fetchId}) to:`, url);

        // Use the provided signal or create a timeout-only controller
        let effectiveSignal = signal;

        if (!signal) {
          timeoutController = new AbortController();
          timeoutId = window.setTimeout(() => {
            console.log(`⏰ Request timeout (#${fetchId})`);
            timeoutController?.abort();
          }, 30000); // 30 second timeout
          effectiveSignal = timeoutController.signal;
        }

        const response = await fetch(url, {
          signal: effectiveSignal,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        if (!response.ok) {
          throw new Error(
            `HTTP error! status: ${response.status} - ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log(`✅ API response received (#${fetchId}):`, data);

        if (mountedRef.current) {
          setLogs(data.logs || []);
          setPagination(data.pagination || null);
          console.log(
            `📊 State updated (#${fetchId}) with logs:`,
            data.logs?.length || 0
          );
        }
      } catch (err) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        if (err instanceof Error && err.name === "AbortError") {
          console.log(`❌ Request aborted (#${fetchId})`);
          // Don't set error state for aborted requests, just log it
          return;
        }

        if (mountedRef.current) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to fetch logs";
          setError(errorMessage);
          console.error(`💥 Error fetching logs (#${fetchId}):`, err);
        }
      } finally {
        // Always set loading to false, even for aborted requests
        if (mountedRef.current) {
          setLoading(false);
          console.log(`✅ Loading set to false (#${fetchId})`);
        }
      }
    },
    [page, limit, filtersString]
  );

  const refetch = useCallback(() => {
    console.log("🔄 Manual refetch triggered");
    fetchLogs();
  }, [fetchLogs]);

  const clearFilters = useCallback(() => {
    console.log("🧹 Clearing filters");
    const newFilters: LogsTableFilters = {};
    setFilters(newFilters);
    setPage(1);
  }, []);

  const stableSetFilters = useCallback((newFilters: LogsTableFilters) => {
    setFilters(newFilters);
  }, []);

  // Initial fetch and changes
  useEffect(() => {
    console.log('🚀 useEffect triggered for fetchLogs dependency change');
    const abortController = new AbortController();
    fetchLogs(abortController.signal);
    return () => {
      abortController.abort();
    };
  }, [page, limit, filtersString]);

  // Reset to page 1 when filters change (but not on initial mount)
  const prevFiltersStringRef = useRef(filtersString);
  useEffect(() => {
    if (prevFiltersStringRef.current !== filtersString && page !== 1) {
      console.log('📄 Resetting to page 1 due to filter change');
      setPage(1);
    }
    prevFiltersStringRef.current = filtersString;
  }, [filtersString, page]);

  return {
    logs,
    pagination,
    loading,
    error,
    refetch,
    setPage,
    setFilters: stableSetFilters,
    clearFilters
  };
}; 