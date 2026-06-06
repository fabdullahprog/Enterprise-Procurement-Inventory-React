// src/components/form/FilterBar.tsx
import React from 'react';

interface FilterBarProps {
  children: React.ReactNode;
  onSearch?: () => void;
  onReset?: () => void;
  onExport?: () => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  children,
  onSearch,
  onReset,
  onExport,
  className = ''
}) => {
  return (
    <div className={`bg-white border-[0.5px] border-gray-300 rounded-[10px] p-4 mb-5 ${className}`}>
      <div className="flex items-end gap-3 flex-wrap">
        {/* Filter Fields */}
        <div className="flex-1 flex items-end gap-3 flex-wrap">
          {children}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onSearch && (
            <button
              type="button"
              onClick={onSearch}
              className="px-4 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          )}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-[13px] font-medium rounded-md hover:bg-gray-200 transition-colors"
            >
              Reset
            </button>
          )}
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="px-4 py-2 bg-green-600 text-white text-[13px] font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              Export
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Filter Field Component
interface FilterFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export const FilterField: React.FC<FilterFieldProps> = ({ 
  label, 
  children,
  className = '' 
}) => {
  return (
    <div className={`min-w-[180px] ${className}`}>
      <label className="block text-[11px] font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
};
