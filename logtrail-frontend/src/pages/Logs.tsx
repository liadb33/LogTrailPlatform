import React, { useState, useCallback } from 'react';
import LogsTable from '../components/dashboard/LogsTable';
import { useLogsTable, LogsTableFilters } from '../hooks/useLogsTable';

const Logs: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<LogsTableFilters>({});
  
  const { 
    logs, 
    pagination, 
    loading, 
    error, 
    refetch, 
    setPage,
    setFilters: updateFilters
  } = useLogsTable({
    page: currentPage,
    limit: 10,
    filters: filters,
    autoRefresh: false
  });

  const handleFiltersChange = useCallback((newFilters: LogsTableFilters) => {
    console.log('📥 Logs.tsx: Received new filters:', JSON.stringify(newFilters));
    setFilters(newFilters);
    updateFilters(newFilters);
    // Reset to first page when filters change
    if (currentPage !== 1) {
      setCurrentPage(1);
      setPage(1);
    }
  }, [updateFilters, currentPage, setPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setPage(page);
  }, [setPage]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Logs</h1>
          <p className="text-gray-600 text-sm mt-1">
            Manual refresh mode (filters enabled)
          </p>
        </div>
        {error && (
          <div className="flex items-center space-x-2">
            <span className="text-red-600 text-sm">{error}</span>
            <button
              onClick={refetch}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        )}
      </div>
      
      <LogsTable 
        logs={logs}
        pagination={pagination}
        loading={loading}
        error={error}
        onFiltersChange={handleFiltersChange}
        onPageChange={handlePageChange}
        onRefresh={refetch}
      />
    </div>
  );
};

export default Logs;