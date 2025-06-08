import React from 'react';
import { useSettings } from '../hooks/useSettings';
import {
  LogRetentionSection,
  SDKIntegrationSection,
  LiveConsoleBehaviorSection,
  LogDisplayPreferencesSection,
  ThemeSection,
  ResetSection,
} from '../components/settings';

const Settings: React.FC = () => {
  const { settings, isLoading, error, actions } = useSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
      
      <LogRetentionSection
        retentionPeriod={settings.retentionPeriod}
        autoDeleteOldLogs={settings.autoDeleteOldLogs}
        onRetentionPeriodChange={actions.updateRetentionPeriod}
        onAutoDeleteToggle={actions.toggleAutoDeleteOldLogs}
        isLoading={isLoading}
        error={error}
      />

      <SDKIntegrationSection
        onCopySnippet={actions.copySDKSnippet}
      />

      <LiveConsoleBehaviorSection
        autoRefreshInterval={settings.autoRefreshInterval}
        maxLogsToDisplay={settings.maxLogsToDisplay}
        onAutoRefreshIntervalChange={actions.updateAutoRefreshInterval}
        onMaxLogsToDisplayChange={actions.updateMaxLogsToDisplay}
        isLoading={isLoading}
        error={error}
      />

      <LogDisplayPreferencesSection
        visibleLogLevels={settings.visibleLogLevels}
        onLogLevelToggle={actions.toggleLogLevel}
      />
      
      <ThemeSection
        darkMode={settings.darkMode}
        onDarkModeToggle={actions.toggleDarkMode}
      />

      <ResetSection
        onResetToDefaults={actions.resetToDefaults}
      />
    </div>
  );
};

export default Settings;