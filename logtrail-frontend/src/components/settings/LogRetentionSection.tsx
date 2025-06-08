import React from 'react';

interface LogRetentionSectionProps {
  retentionPeriod: string;
  autoDeleteOldLogs: boolean;
  onRetentionPeriodChange: (value: string) => void;
  onAutoDeleteToggle: () => void;
  isLoading?: boolean;
  error?: string | null;
}

const LogRetentionSection: React.FC<LogRetentionSectionProps> = ({
  retentionPeriod,
  autoDeleteOldLogs,
  onRetentionPeriodChange,
  onAutoDeleteToggle,
  isLoading = false,
  error = null,
}) => {
  const retentionOptions = ['7 days', '30 days', '90 days'];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-lg">⚙️</span>
        <h2 className="text-lg font-semibold text-gray-800">Log Retention</h2>
        {isLoading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">Error: {error}</p>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Retention Period
          </label>
          <select
            value={retentionPeriod}
            onChange={(e) => onRetentionPeriodChange(e.target.value)}
            disabled={isLoading}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {retentionOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Auto-Delete Old Logs
          </label>
          <button
            onClick={onAutoDeleteToggle}
            disabled={isLoading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              autoDeleteOldLogs ? 'bg-blue-600' : 'bg-gray-200'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoDeleteOldLogs ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogRetentionSection; 