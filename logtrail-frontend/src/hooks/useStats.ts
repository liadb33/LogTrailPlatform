import { useState, useEffect, useRef } from 'react';

interface Stats {
  errors: number;
  totalLogs: number;
  uniqueUsers: number;
  topErrorTag: {
    tag: string;
    percentage: number;
  };
  logRate: number;
  peakLogs: {
    count: number;
    time: string;
  };
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
}

interface StatsResponse {
  stats: Stats;
  chartData: ChartData;
}

interface UseStatsReturn {
  stats: Stats;
  chartData: ChartData;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const useStats = (): UseStatsReturn => {
  const [stats, setStats] = useState<Stats>({
    errors: 0,
    totalLogs: 0,
    uniqueUsers: 0,
    topErrorTag: {
      tag: '',
      percentage: 0,
    },
    logRate: 0,
    peakLogs: {
      count: 0,
      time: '00:00',
    },
  });

  const [chartData, setChartData] = useState<ChartData>({
    labels: [
      '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
      '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
    ],
    datasets: [
      {
        label: 'Log Activity',
        data: Array(24).fill(0),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialLoadRef = useRef<boolean>(true);

  const fetchStats = async (isBackgroundRefresh = false) => {
    try {
      // Only show loading spinner for initial load, not background refreshes
      if (!isBackgroundRefresh) {
        setLoading(true);
      }
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/logs/stats`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status} ${response.statusText}`);
      }
      
      const data: StatsResponse = await response.json();
      
      // Update stats
      setStats(data.stats);
      
      // Update chart data
      setChartData(data.chartData);
      
      // Mark initial load as complete
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching stats:', err);
    } finally {
      // Only set loading false if this wasn't a background refresh
      if (!isBackgroundRefresh || isInitialLoadRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchStats(false);
    
    // Set up polling to refresh stats every 30 seconds (background refreshes)
    const interval = setInterval(() => fetchStats(true), 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Manual refetch function (shows loading)
  const refetch = () => fetchStats(false);

  return { 
    stats, 
    chartData, 
    loading, 
    error, 
    refetch 
  };
};