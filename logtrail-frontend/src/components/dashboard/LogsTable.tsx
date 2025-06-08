import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Search, Copy, Eye, RefreshCw, Loader2 } from 'lucide-react';
import { LogItem, LogsTableFilters, PaginationInfo } from '../../hooks/useLogsTable';
import { useTags } from '../../hooks/useTags';
import { useDebounce } from '../../hooks/useDebounce';
import LogDetailsModal from './LogDetailsModal';
import MultiSelect from '../filters/MultiSelect';
import FilterChip from '../filters/FilterChip';
import DateRangePicker from '../filters/DateRangePicker';
import { useToast } from '../../contexts/ToastContext';

interface LogTableProps {
  logs: LogItem[];
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
  onFiltersChange: (filters: LogsTableFilters) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

const LogsTable: React.FC<LogTableProps> = ({ 
  logs, 
  pagination, 
  loading, 
  error, 
  onFiltersChange,
  onPageChange, 
  onRefresh
}) => {
  const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [userId, setUserId] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);

  // Scroll position preservation
  const scrollPositionRef = useRef<number>(0);
  const isRefreshingRef = useRef<boolean>(false);
  const prevLoadingRef = useRef<boolean>(loading);

  // Get tags from backend
  const { tags: availableTags, loading: tagsLoading } = useTags();

  const levelOptions = ['error', 'warning', 'info', 'debug'];

  // Restore scroll position after loading completes
  useEffect(() => {
    if (isRefreshingRef.current && prevLoadingRef.current && !loading) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        window.scrollTo(0, scrollPositionRef.current);
        isRefreshingRef.current = false;
        console.log('📍 Restored scroll position:', scrollPositionRef.current);
      }, 10);
    }
    prevLoadingRef.current = loading;
  }, [loading]);

  // Debounce search and userId inputs for better performance
  const debouncedSearch = useDebounce(searchTerm, 500);
  const debouncedUserId = useDebounce(userId, 500);

  // Memoize the filters object to prevent unnecessary re-renders
  const filters = useMemo((): LogsTableFilters => {
    const newFilters: LogsTableFilters = {};
    
    if (selectedLevels.length > 0) {
      newFilters.levels = selectedLevels;
    }
    
    if (selectedTags.length > 0) {
      newFilters.tags = selectedTags;
    }
    
    if (debouncedUserId.trim()) {
      newFilters.userId = debouncedUserId.trim();
    }
    
    if (debouncedSearch.trim()) {
      newFilters.search = debouncedSearch.trim();
    }
    
    if (dateRange) {
      newFilters.startDate = dateRange.start;
      newFilters.endDate = dateRange.end;
    }

    return newFilters;
  }, [selectedLevels, selectedTags, debouncedUserId, debouncedSearch, dateRange]);

  // Create a stable string representation for useEffect dependency
  const filtersString = useMemo(() => {
    return JSON.stringify({
      levels: filters.levels?.sort() || [],
      tags: filters.tags?.sort() || [],
      userId: filters.userId || '',
      search: filters.search || '',
      startDate: filters.startDate || '',
      endDate: filters.endDate || ''
    });
  }, [filters]);

  // Ref to track previous filters to prevent unnecessary calls
  const prevFiltersRef = useRef<string>('{}');

  // Update parent filters when local filters change
  useEffect(() => {
    if (prevFiltersRef.current !== filtersString) {
      console.log('🔄 LogsTable: Filters changed, updating parent');
      console.log('🔍 LogsTable: New filters:', JSON.stringify(filters));
      onFiltersChange(filters);
      prevFiltersRef.current = filtersString;
    }
  }, [filtersString, filters, onFiltersChange]);

  const { showSuccess, showError } = useToast();

  const clearFilters = () => {
    setSelectedLevels([]);
    setSelectedTags([]);
    setUserId('');
    setDateRange(null);
    setSearchTerm('');
  };

  const handleCopyLog = async (log: LogItem) => {
    // Format the entire log details nicely
    const formattedLog = `📝 Log Details
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🕐 Timestamp: ${log.timestamp}
👤 User ID: ${log.userId}
📊 Level: ${log.level.toUpperCase()}
🏷️ Tag: ${log.tag}
🖥️ System: ${log.system}
${log.threadId ? `🧵 Thread ID: ${log.threadId}` : ''}${log.processId ? `\n⚙️ Process ID: ${log.processId}` : ''}${log.packageName ? `\n📦 Package: ${log.packageName}` : ''}

💬 Message:
${log.message}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    try {
      await navigator.clipboard.writeText(formattedLog);
      showSuccess('Copied!', 'Complete log details copied to clipboard');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = formattedLog;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showSuccess('Copied!', 'Complete log details copied to clipboard');
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
        showError('Copy failed', 'Unable to copy log details to clipboard');
      }
    }
  };

  const getLevelBadgeClass = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'debug':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderPagination = () => {
    if (!pagination || pagination.total_pages <= 1) return null;

    const { current_page, total_pages, has_prev, has_next } = pagination;
    const pages = [];
    
    // Calculate which pages to show
    const startPage = Math.max(1, current_page - 2);
    const endPage = Math.min(total_pages, current_page + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Showing page {current_page} of {total_pages} ({pagination.total_count} total logs)
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onPageChange(current_page - 1)}
            disabled={!has_prev || loading}
            className={`px-3 py-1 rounded ${
              !has_prev || loading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>
          
          {pages.map(pageNumber => (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              disabled={loading}
              className={`px-3 py-1 rounded ${
                current_page === pageNumber 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } ${loading ? 'cursor-not-allowed' : ''}`}
            >
              {pageNumber}
            </button>
          ))}
          
          <button
            onClick={() => onPageChange(current_page + 1)}
            disabled={!has_next || loading}
            className={`px-3 py-1 rounded ${
              !has_next || loading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  // Wrapper for refresh with scroll preservation
  const handleRefreshWithScrollPreservation = useCallback(() => {
    // Save current scroll position
    scrollPositionRef.current = window.pageYOffset || document.documentElement.scrollTop;
    isRefreshingRef.current = true;
    
    console.log('💾 LogsTable: Saving scroll position:', scrollPositionRef.current);
    
    // Call the original onRefresh
    onRefresh();
  }, [onRefresh]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Logs Table</h2>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleRefreshWithScrollPreservation}
                disabled={loading}
                className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
                title="Refresh logs"
              >
                <RefreshCw size={16} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  clearFilters();
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear all filters
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MultiSelect
              options={levelOptions}
              selected={selectedLevels}
              onChange={setSelectedLevels}
              placeholder="Filter by Level"
            />
            <MultiSelect
              options={availableTags}
              selected={selectedTags}
              onChange={setSelectedTags}
              placeholder={tagsLoading ? "Loading tags..." : "Filter by Tag"}
              disabled={tagsLoading}
            />
            <div className="relative">
              <input
                type="text"
                placeholder="Filter by User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <DateRangePicker onChange={setDateRange} />
          </div>

          {/* Active Filters */}
          {(selectedLevels.length > 0 || selectedTags.length > 0 || userId || dateRange || searchTerm) && (
            <div className="flex flex-wrap gap-2 pt-2">
              {searchTerm && (
                <FilterChip
                  label="Search"
                  value={searchTerm}
                  onRemove={() => setSearchTerm('')}
                />
              )}
              {selectedLevels.map(level => (
                <FilterChip
                  key={level}
                  label="Level"
                  value={level}
                  onRemove={() => setSelectedLevels(selectedLevels.filter(l => l !== level))}
                />
              ))}
              {selectedTags.map(tag => (
                <FilterChip
                  key={tag}
                  label="Tag"
                  value={tag}
                  onRemove={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                />
              ))}
              {userId && (
                <FilterChip
                  label="User ID"
                  value={userId}
                  onRemove={() => setUserId('')}
                />
              )}
              {dateRange && (
                <FilterChip
                  label="Date Range"
                  value="Active"
                  onRemove={() => setDateRange(null)}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading logs...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-red-600 mb-2">{error}</p>
            <button
              type="button"
              onClick={handleRefreshWithScrollPreservation}
              className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tag
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getLevelBadgeClass(log.level)}`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.tag}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {log.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleCopyLog(log)}
                          className="text-gray-600 hover:text-blue-600 transition-colors"
                          title="Copy complete log details to clipboard"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-gray-600 hover:text-blue-600 transition-colors"
                          title="View log details"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && renderPagination()}

      {/* Log Details Modal */}
      {selectedLog && (
        <LogDetailsModal
          isOpen={selectedLog !== null}
          onClose={() => setSelectedLog(null)}
          log={selectedLog}
        />
      )}
    </div>
  );
};

export default LogsTable;