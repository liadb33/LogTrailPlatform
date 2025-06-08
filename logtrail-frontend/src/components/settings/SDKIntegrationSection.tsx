import React from 'react';
import { Copy } from 'lucide-react';

interface SDKIntegrationSectionProps {
  onCopySnippet: () => void;
}

const SDKIntegrationSection: React.FC<SDKIntegrationSectionProps> = ({
  onCopySnippet,
}) => {
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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-lg">📦</span>
        <h2 className="text-lg font-semibold text-gray-800">SDK Integration</h2>
      </div>
      
      <div className="relative">
        <pre className="bg-gray-100 rounded-md p-4 text-sm text-gray-800 overflow-x-auto">
          <code>{sdkSnippet}</code>
        </pre>
        <button
          onClick={onCopySnippet}
          className="absolute top-3 right-3 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
          title="Copy to clipboard"
        >
          <Copy size={16} />
        </button>
      </div>
    </div>
  );
};

export default SDKIntegrationSection; 