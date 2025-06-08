import React from 'react';

interface LiveConsoleBehaviorSectionProps {
  autoRefreshInterval: string;
  maxLogsToDisplay: string;
  onAutoRefreshIntervalChange: (value: string) => void;
  onMaxLogsToDisplayChange: (value: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

const LiveConsoleBehaviorSection: React.FC<LiveConsoleBehaviorSectionProps> = ({
  autoRefreshInterval,
  maxLogsToDisplay,
  onAutoRefreshIntervalChange,
  onMaxLogsToDisplayChange,
  isLoading = false,
  error = null,
}) => {
  const refreshIntervals = ['5s', '10s', '30s'];
  const maxLogsOptions = ['100', '500', '1000'];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-lg">🖥️</span>
        <h2 className="text-lg font-semibold text-gray-800">Live Console Behavior</h2>
        {isLoading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">Error: {error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Auto-Refresh Interval
          </label>
          <select
            value={autoRefreshInterval}
            onChange={(e) => onAutoRefreshIntervalChange(e.target.value)}
            disabled={isLoading}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {refreshIntervals.map(interval => (
              <option key={interval} value={interval}>{interval}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Logs to Display
          </label>
          <select
            value={maxLogsToDisplay}
            onChange={(e) => onMaxLogsToDisplayChange(e.target.value)}
            disabled={isLoading}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {maxLogsOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default LiveConsoleBehaviorSection; 