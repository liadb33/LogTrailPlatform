import React from 'react';

interface LogDisplayPreferencesSectionProps {
  visibleLogLevels: string[];
  onLogLevelToggle: (level: string) => void;
}

const LogDisplayPreferencesSection: React.FC<LogDisplayPreferencesSectionProps> = ({
  visibleLogLevels,
  onLogLevelToggle,
}) => {
  const logLevels = ['info', 'error', 'debug', 'warning', 'trace'];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-lg">🧮</span>
        <h2 className="text-lg font-semibold text-gray-800">Log Display Preferences</h2>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Default Visible Log Levels
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {logLevels.map(level => (
            <label key={level} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={visibleLogLevels.includes(level)}
                onChange={() => onLogLevelToggle(level)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 capitalize">{level}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogDisplayPreferencesSection; 