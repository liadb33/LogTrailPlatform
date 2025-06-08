import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface DateRangePickerProps {
  onChange: (range: { start: string; end: string } | null) => void;
}

const PRESET_RANGES = [
  { label: 'Today', value: 'today' },
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Clear filter', value: 'clear' },
];

const DateRangePicker: React.FC<DateRangePickerProps> = ({ onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const calculateDateRange = (range: string): { start: string; end: string } | null => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (range) {
      case 'today':
        // Start of today in local time, then convert to UTC
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        // End of today in local time, then convert to UTC
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case '24h':
        // 24 hours ago from start of current day to end of current day
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        // Set to start of the day 24h ago
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0);
        // End at the end of current day
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case '7d':
        // 7 days ago from start of that day to end of current day
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = new Date(sevenDaysAgo.getFullYear(), sevenDaysAgo.getMonth(), sevenDaysAgo.getDate(), 0, 0, 0, 0);
        // End at the end of current day
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case '30d':
        // 30 days ago from start of that day to end of current day
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        startDate = new Date(thirtyDaysAgo.getFullYear(), thirtyDaysAgo.getMonth(), thirtyDaysAgo.getDate(), 0, 0, 0, 0);
        // End at the end of current day
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      default:
        return null;
    }

    return {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    };
  };

  const handleRangeSelect = (range: string) => {
    if (range === 'clear') {
      setSelectedRange(null);
      onChange(null);
    } else {
      setSelectedRange(range);
      const dateRange = calculateDateRange(range);
      onChange(dateRange);
    }
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (!selectedRange) return 'Select date range';
    const preset = PRESET_RANGES.find(r => r.value === selectedRange);
    return preset?.label || 'Select date range';
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center">
          <Calendar size={16} className="mr-2" />
          <span className={selectedRange ? 'text-gray-900' : 'text-gray-500'}>
            {getDisplayText()}
          </span>
        </div>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg border border-gray-200 z-10">
          <div className="py-1">
            {PRESET_RANGES.map(range => (
              <button
                key={range.value}
                onClick={() => handleRangeSelect(range.value)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  selectedRange === range.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                } ${range.value === 'clear' ? 'border-t border-gray-200 text-red-600 hover:bg-red-50' : ''}`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;