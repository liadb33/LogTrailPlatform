import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeSectionProps {
  darkMode: boolean;
  onDarkModeToggle: () => void;
}

const ThemeSection: React.FC<ThemeSectionProps> = ({
  darkMode,
  onDarkModeToggle,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-lg">🌗</span>
        <h2 className="text-lg font-semibold text-gray-800">Theme</h2>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-gray-700">Dark Mode</label>
          <div className="flex items-center space-x-2 text-gray-500">
            <Sun size={16} />
            <span className="text-xs">Light</span>
          </div>
        </div>
        <button
          onClick={onDarkModeToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            darkMode ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              darkMode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <div className="flex items-center space-x-2 text-gray-500">
          <span className="text-xs">Dark</span>
          <Moon size={16} />
        </div>
      </div>
    </div>
  );
};

export default ThemeSection; 