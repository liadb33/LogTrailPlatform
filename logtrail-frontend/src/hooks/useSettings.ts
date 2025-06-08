import { useState, useCallback, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';

// Backend API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface SettingsState {
  retentionPeriod: string;
  autoDeleteOldLogs: boolean;
  autoRefreshInterval: string;
  maxLogsToDisplay: string;
  visibleLogLevels: string[];
  darkMode: boolean;
}

interface RetentionSettings {
  retentionPeriod: string;
  autoDeleteOldLogs: boolean;
}

interface LiveConsoleSettings {
  autoRefreshInterval: string;
  maxLogsToDisplay: string;
}

const defaultSettings: SettingsState = {
  retentionPeriod: '30 days',
  autoDeleteOldLogs: true,
  autoRefreshInterval: '10s',
  maxLogsToDisplay: '100',
  visibleLogLevels: ['info', 'error', 'warning'],
  darkMode: false,
};

export const useSettings = () => {
  const { showSuccess, showError } = useToast();
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch retention settings from backend
  const fetchRetentionSettings = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/retention`);
      if (!response.ok) {
        throw new Error(`Failed to fetch retention settings: ${response.status} ${response.statusText}`);
      }
      const retentionData: RetentionSettings = await response.json();
      setSettings(prev => ({
        ...prev,
        retentionPeriod: retentionData.retentionPeriod,
        autoDeleteOldLogs: retentionData.autoDeleteOldLogs,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch retention settings';
      setError(errorMessage);
      console.error('Error fetching retention settings:', err);
    }
  }, []);

  // Fetch live console settings from backend
  const fetchLiveConsoleSettings = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/live-console`);
      if (!response.ok) {
        throw new Error(`Failed to fetch live console settings: ${response.status} ${response.statusText}`);
      }
      const liveConsoleData: LiveConsoleSettings = await response.json();
      setSettings(prev => ({
        ...prev,
        autoRefreshInterval: liveConsoleData.autoRefreshInterval,
        maxLogsToDisplay: liveConsoleData.maxLogsToDisplay,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch live console settings';
      setError(errorMessage);
      console.error('Error fetching live console settings:', err);
    }
  }, []);

  // Save retention settings to backend
  const saveRetentionSettings = useCallback(async (retentionData: RetentionSettings) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/settings/retention`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(retentionData),
      });
      if (!response.ok) {
        throw new Error(`Failed to save retention settings: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save retention settings';
      setError(errorMessage);
      console.error('Error saving retention settings:', err);
      throw err; // Re-throw to allow caller to handle
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save live console settings to backend
  const saveLiveConsoleSettings = useCallback(async (liveConsoleData: LiveConsoleSettings) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/settings/live-console`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(liveConsoleData),
      });
      if (!response.ok) {
        throw new Error(`Failed to save live console settings: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save live console settings';
      setError(errorMessage);
      console.error('Error saving live console settings:', err);
      throw err; // Re-throw to allow caller to handle
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load all settings on component mount
  useEffect(() => {
    const loadAllSettings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchRetentionSettings(),
          fetchLiveConsoleSettings()
        ]);
      } catch (err) {
        // Individual errors are already handled in the fetch functions
      } finally {
        setIsLoading(false);
      }
    };

    loadAllSettings();
  }, [fetchRetentionSettings, fetchLiveConsoleSettings]);

  const updateRetentionPeriod = useCallback(async (value: string) => {
    const newRetentionData = {
      retentionPeriod: value,
      autoDeleteOldLogs: settings.autoDeleteOldLogs,
    };
    
    try {
      await saveRetentionSettings(newRetentionData);
      setSettings(prev => ({ ...prev, retentionPeriod: value }));
    } catch (err) {
      // Error is already logged in saveRetentionSettings
      // The UI will show the error state through the error variable
    }
  }, [settings.autoDeleteOldLogs, saveRetentionSettings]);

  const toggleAutoDeleteOldLogs = useCallback(async () => {
    const newAutoDelete = !settings.autoDeleteOldLogs;
    const newRetentionData = {
      retentionPeriod: settings.retentionPeriod,
      autoDeleteOldLogs: newAutoDelete,
    };
    
    try {
      await saveRetentionSettings(newRetentionData);
      setSettings(prev => ({ ...prev, autoDeleteOldLogs: newAutoDelete }));
    } catch (err) {
      // Error is already logged in saveRetentionSettings
      // The UI will show the error state through the error variable
    }
  }, [settings.retentionPeriod, settings.autoDeleteOldLogs, saveRetentionSettings]);

  const updateAutoRefreshInterval = useCallback(async (value: string) => {
    const newLiveConsoleData = {
      autoRefreshInterval: value,
      maxLogsToDisplay: settings.maxLogsToDisplay,
    };
    
    try {
      await saveLiveConsoleSettings(newLiveConsoleData);
      setSettings(prev => ({ ...prev, autoRefreshInterval: value }));
    } catch (err) {
      // Error is already logged in saveLiveConsoleSettings
      // The UI will show the error state through the error variable
    }
  }, [settings.maxLogsToDisplay, saveLiveConsoleSettings]);

  const updateMaxLogsToDisplay = useCallback(async (value: string) => {
    const newLiveConsoleData = {
      autoRefreshInterval: settings.autoRefreshInterval,
      maxLogsToDisplay: value,
    };
    
    try {
      await saveLiveConsoleSettings(newLiveConsoleData);
      setSettings(prev => ({ ...prev, maxLogsToDisplay: value }));
    } catch (err) {
      // Error is already logged in saveLiveConsoleSettings
      // The UI will show the error state through the error variable
    }
  }, [settings.autoRefreshInterval, saveLiveConsoleSettings]);

  const toggleLogLevel = useCallback((level: string) => {
    setSettings(prev => ({
      ...prev,
      visibleLogLevels: prev.visibleLogLevels.includes(level)
        ? prev.visibleLogLevels.filter(l => l !== level)
        : [...prev.visibleLogLevels, level]
    }));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const copySDKSnippet = useCallback(() => {
    const sdkSnippet = `// Add to your app-level build.gradle (Module: app)
dependencies {
    implementation project(':logtrail-sdk')
    // or if using as external dependency:
    // implementation 'com.example:logtrail-sdk:1.0.0'
}

// Initialize in your Application class or MainActivity
import com.example.logtrail_sdk.Utilities.LogTrail;
import com.example.logtrail_sdk.Logger.LogTrailLogger;

// Initialize the SDK (call this once in your Application class)
LogTrail.init(this, "your-user-id");

// Use the logger anywhere in your app
LogTrailLogger.d("MainActivity", "Debug message from Android app");
LogTrailLogger.i("UserAction", "User logged in successfully");
LogTrailLogger.w("Performance", "Slow network response detected");
LogTrailLogger.e("Error", "Failed to load user data");`;

    try {
      navigator.clipboard.writeText(sdkSnippet);
      showSuccess('SDK Code Copied!', 'Integration snippet copied to clipboard');
    } catch (error) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = sdkSnippet;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showSuccess('SDK Code Copied!', 'Integration snippet copied to clipboard');
      } catch (fallbackErr) {
        console.error('Failed to copy SDK snippet:', fallbackErr);
        showError('Copy failed', 'Unable to copy SDK snippet to clipboard');
      }
    }
  }, [showSuccess, showError]);

  // Future: This is where you would add API calls to save/load settings
  const saveSettings = useCallback(async () => {
    try {
      // TODO: Implement API call to save settings
      console.log('Saving settings:', settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings]);

  const loadSettings = useCallback(async () => {
    try {
      // TODO: Implement API call to load settings
      console.log('Loading settings...');
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  return {
    settings,
    isLoading,
    error,
    actions: {
      updateRetentionPeriod,
      toggleAutoDeleteOldLogs,
      updateAutoRefreshInterval,
      updateMaxLogsToDisplay,
      toggleLogLevel,
      toggleDarkMode,
      resetToDefaults,
      copySDKSnippet,
      saveSettings,
      loadSettings,
    },
  };
}; 