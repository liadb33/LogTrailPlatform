import React, { useState, useCallback, useRef, useEffect } from "react";
import KPICard from "../components/dashboard/KPICard";
import LogActivityChart from "../components/dashboard/LogActivityChart";
import LiveConsole from "../components/dashboard/LiveConsole";
import LogsTable from "../components/dashboard/LogsTable";
import {
  AlertTriangle,
  BarChart2,
  Users,
  Flame,
  Zap,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { useStats } from "../hooks/useStats";
import { useLogsTable, LogsTableFilters } from "../hooks/useLogsTable";

const Overview: React.FC = () => {
  const [filters, setFilters] = useState<LogsTableFilters>({});
  const scrollPositionRef = useRef<number>(0);
  const isRefreshingRef = useRef<boolean>(false);

  const {
    stats,
    chartData,
    loading: statsLoading,
    error: statsError,
    refetch,
  } = useStats();

  // Use useLogsTable with filter support
  const {
    logs,
    pagination,
    loading: logsLoading,
    error: logsError,
    refetch: refetchLogs,
    setPage,
    setFilters: updateFilters,
  } = useLogsTable({
    limit: 5,
    filters: filters,
    autoRefresh: false,
  });

  // Restore scroll position after loading completes
  useEffect(() => {
    if (isRefreshingRef.current && !logsLoading) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        window.scrollTo(0, scrollPositionRef.current);
        isRefreshingRef.current = false;
      }, 10);
    }
  }, [logsLoading]);

  // Handler for filter changes
  const handleFiltersChange = useCallback((newFilters: LogsTableFilters) => {
    console.log('📥 Overview.tsx: Received new filters:', JSON.stringify(newFilters));
    setFilters(newFilters);
    updateFilters(newFilters);
  }, [updateFilters]);

  // Handler for LogsTable pagination
  const handlePageChange = useCallback((page: number) => {
    setPage(page);
  }, [setPage]);

  // Handler for logs table refresh only (doesn't refresh stats)
  const handleLogsRefresh = useCallback(() => {
    refetchLogs();
  }, [refetchLogs]);

  // Handler for full page refresh with scroll position preservation
  const handleFullRefresh = useCallback(() => {
    // Save current scroll position
    scrollPositionRef.current = window.pageYOffset || document.documentElement.scrollTop;
    isRefreshingRef.current = true;
    
    console.log('💾 Saving scroll position:', scrollPositionRef.current);
    
    // Trigger refresh
    refetch();
    refetchLogs();
  }, [refetch, refetchLogs]);

  // Loading state
  if (statsLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2 text-gray-500">
            <RefreshCw className="animate-spin" size={20} />
            <span>Loading dashboard stats...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (statsError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 text-red-700 mb-4">
            <AlertTriangle size={20} />
            <span className="font-medium">Error loading dashboard data</span>
          </div>
          <p className="text-red-600 mb-4">{statsError}</p>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              refetch();
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleFullRefresh();
          }}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          title="Refresh data"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Errors (Last 24h)"
          value={stats.errors}
          icon={<AlertTriangle size={24} />}
          color="red"
        />
        <KPICard
          title="Total Logs"
          value={stats.totalLogs.toLocaleString()}
          icon={<BarChart2 size={24} />}
        />
        <KPICard
          title="Unique Users"
          value={stats.uniqueUsers.toLocaleString()}
          icon={<Users size={24} />}
        />
        <KPICard
          title="Top Error Tag"
          value={
            stats.topErrorTag.tag
              ? `${stats.topErrorTag.tag} (${stats.topErrorTag.percentage}%)`
              : "No errors"
          }
          icon={<Flame size={24} />}
          color="red"
        />
        <KPICard
          title="Log Rate"
          value={`${stats.logRate} logs/min`}
          icon={<Zap size={24} />}
          color="blue"
        />
        <KPICard
          title="Peak Logs (24h)"
          value={`${stats.peakLogs.count.toLocaleString()} @ ${
            stats.peakLogs.time
          }`}
          icon={<TrendingUp size={24} />}
          color="green"
        />
      </div>

      <LogActivityChart data={chartData} />

      <LiveConsole />

      <div className="mt-8">
        <LogsTable
          logs={logs}
          pagination={pagination}
          loading={logsLoading}
          error={logsError}
          onFiltersChange={handleFiltersChange}
          onPageChange={handlePageChange}
          onRefresh={handleLogsRefresh}
        />
      </div>
    </div>
  );
};

export default Overview;
