import React from 'react';
import { RotateCcw } from 'lucide-react';

interface ResetSectionProps {
  onResetToDefaults: () => void;
}

const ResetSection: React.FC<ResetSectionProps> = ({
  onResetToDefaults,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-lg">♻️</span>
        <h2 className="text-lg font-semibold text-gray-800">Reset</h2>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
            Restore all settings to their default values
          </p>
        </div>
        <button
          onClick={onResetToDefaults}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <RotateCcw size={16} />
          <span>Reset to Default</span>
        </button>
      </div>
    </div>
  );
};

export default ResetSection; 