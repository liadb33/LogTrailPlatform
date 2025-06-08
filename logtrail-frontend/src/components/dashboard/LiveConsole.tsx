import React, { useState, useRef, useEffect } from 'react';
import { useLogs } from '../../hooks/useLogs';
import { useSettings } from '../../hooks/useSettings';
import MultiSelect from '../filters/MultiSelect';
import FilterChip from '../filters/FilterChip';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface LiveConsoleProps {
  size?: 'small' | 'large';
}

// Helper function to convert settings format to milliseconds
const getRefreshIntervalMs = (intervalSetting: string): number => {
  switch (intervalSetting) {
    case '5s':
      return 5000;
    case '10s':
      return 10000;
    case '30s':
      return 30000;
    default:
      return 5000; // fallback
  }
};

const LiveConsole: React.FC<LiveConsoleProps> = ({ size = 'small' }) => {
  const [autoScroll, setAutoScroll] = useState(true);
  const [userId, setUserId] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const consoleRef = useRef<HTMLDivElement>(null);
  
  // Get settings from the backend
  const { settings } = useSettings();
  
  // Convert settings to the format needed by useLogs
  const refreshIntervalMs = getRefreshIntervalMs(settings.autoRefreshInterval);
  const maxLogsLimit = parseInt(settings.maxLogsToDisplay, 10);
  
  // Use the new useLogs hook with filtering and dynamic settings
  const { logs, loading, error, refetch } = useLogs({
    limit: maxLogsLimit,
    userId: userId || undefined,
    levels: selectedLevels.length > 0 ? selectedLevels : undefined,
    autoRefresh,
    refreshInterval: refreshIntervalMs
  });
  
  const levelOptions = ['info', 'error', 'warning', 'debug'];
  
  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const clearFilters = () => {
    setUserId('');
    setSelectedLevels([]);
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  const handleRefresh = () => {
    refetch();
  };

  const getLevelClass = (level: string) => {
    switch (level) {
      case 'info':
        return 'bg-blue-600';
      case 'error':
        return 'bg-red-600';
      case 'warning':
        return 'bg-yellow-600';
      case 'debug':
        return 'bg-gray-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Real-Time SDK Logs</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleAutoRefresh}
                className={`px-3 py-1 rounded text-sm ${
                  autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
                title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
              >
                Auto-Refresh {autoRefresh ? 'On' : 'Off'}
              </button>
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={`px-3 py-1 rounded text-sm ${
                  autoScroll ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}
                title={autoScroll ? 'Auto-scroll enabled' : 'Auto-scroll disabled'}
              >
                Auto-Scroll {autoScroll ? 'On' : 'Off'}
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-3 py-1 rounded text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 flex items-center space-x-1"
                title="Refresh logs"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MultiSelect
              options={levelOptions}
              selected={selectedLevels}
              onChange={setSelectedLevels}
              placeholder="Filter by Level"
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
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {(selectedLevels.length > 0 || userId) && (
            <div className="flex flex-wrap gap-2">
              {selectedLevels.map(level => (
                <FilterChip
                  key={level}
                  label="Level"
                  value={level}
                  onRemove={() => setSelectedLevels(selectedLevels.filter(l => l !== level))}
                />
              ))}
              {userId && (
                <FilterChip
                  label="User ID"
                  value={userId}
                  onRemove={() => setUserId('')}
                />
              )}
            </div>
          )}

          {/* Status indicator */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {loading ? 'Loading...' : `${logs.length} logs (max: ${settings.maxLogsToDisplay})`}
              {autoRefresh && ` • Auto-refreshing every ${settings.autoRefreshInterval}`}
            </span>
            {error && (
              <div className="flex items-center space-x-1 text-red-600">
                <AlertTriangle size={12} />
                <span>Connection error</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertTriangle size={16} />
            <span className="text-sm font-medium">Error loading logs</span>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={handleRefresh}
            className="text-red-700 text-sm underline mt-2"
          >
            Try again
          </button>
        </div>
      )}
      
      {/* Console output */}
      <div 
        ref={consoleRef}
        className={`bg-gray-900 text-gray-100 font-mono text-sm p-4 overflow-y-auto ${
          size === 'large' 
            ? 'h-96 lg:h-[calc(100vh-24rem)] min-h-96' 
            : 'h-64'
        }`}
      >
        {loading && logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <RefreshCw className="animate-spin mr-2" size={16} />
            Loading logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            No logs found
          </div>
        ) : (
          logs.map((log) => (
            <div 
              key={log.id} 
              className="mb-1 hover:bg-gray-800 px-1 rounded"
            >
              <span className="text-gray-400">{log.timestamp}</span>{' '}
              <span className={`px-2 py-0.5 rounded text-xs ${getLevelClass(log.level)} text-white`}>
                {log.level.toUpperCase()}
              </span>{' '}
              <span>{log.message}</span>
              {log.userId && (
                <span className="text-gray-400"> [User: {log.userId}]</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveConsole;