import { useState } from 'react';

interface LogEntry {
  id: string;
  timestamp: string;
  userId: string;
  level: string;
  tag: string;
  message: string;
  system: string;
}

export const useMockLogs = () => {
  // Generate mock log data
  const generateMockLogs = (): LogEntry[] => {
    const levels = ['Info', 'Error', 'Warning', 'Debug', 'Low'];
    const tags = ['Error', 'Log', 'Auth', 'API', 'Database'];
    const messages = [
      'Error centrumgid',
      'Inbox log loga',
      'Out of nbeck',
      'User authentication failed',
      'API request timeout',
      'Database connection error',
      'Cache invalidated',
      'Session expired',
      'Rate limit exceeded',
      'Invalid request parameters',
    ];
    const systems = ['system', 'inbox', 'auth', 'api', 'database', 'cache', 'Out of nbeck'];
    
    return Array.from({ length: 100 }, (_, i) => {
      const level = levels[Math.floor(Math.random() * levels.length)];
      const tag = tags[Math.floor(Math.random() * tags.length)];
      const message = messages[Math.floor(Math.random() * messages.length)];
      const system = systems[Math.floor(Math.random() * systems.length)];
      const userId = Math.floor(100000 + Math.random() * 900000).toString();
      const hour = Math.floor(Math.random() * 24).toString().padStart(2, '0');
      const minute = Math.floor(Math.random() * 60).toString().padStart(2, '0');
      const second = Math.floor(Math.random() * 60).toString().padStart(2, '0');
      
      return {
        id: i.toString(),
        timestamp: `${hour}:${minute}:${second}`,
        userId,
        level,
        tag,
        message,
        system,
      };
    });
  };
  
  const [logs] = useState<LogEntry[]>(generateMockLogs());
  
  return { logs };
};