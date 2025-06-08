import React from 'react';
import LiveConsoleComponent from '../components/dashboard/LiveConsole';

const LiveConsole: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Live Console</h1>
      
      <LiveConsoleComponent size="large" />
    </div>
  );
};

export default LiveConsole;