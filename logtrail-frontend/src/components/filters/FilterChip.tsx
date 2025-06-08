import React from 'react';
import { X } from 'lucide-react';

interface FilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, value, onRemove }) => {
  return (
    <div className="inline-flex items-center bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-sm">
      <span className="mr-1 text-blue-500">{label}:</span>
      <span className="mr-2">{value}</span>
      <button
        onClick={onRemove}
        className="text-blue-500 hover:text-blue-700 focus:outline-none"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default FilterChip;