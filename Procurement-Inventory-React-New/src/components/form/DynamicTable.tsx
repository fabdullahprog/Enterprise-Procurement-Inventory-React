// src/components/form/DynamicTable.tsx
import React from 'react';

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any, index: number) => React.ReactNode;
}

interface DynamicTableProps {
  columns: TableColumn[];
  data: any[];
  onRowChange?: (index: number, key: string, value: any) => void;
  onRowRemove?: (index: number) => void;
  readOnly?: boolean;
  minRows?: number;
}

export const DynamicTable: React.FC<DynamicTableProps> = ({
  columns,
  data,
  onRowChange,
  onRowRemove,
  readOnly = false,
  minRows = 1
}) => {
  const canRemove = !readOnly && data.length > minRows;

  return (
    <div className="w-full overflow-x-auto relative">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr>
            <th className="w-12 px-3 py-2.5 text-left">
              #
            </th>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-3 py-2.5 text-${col.align || 'center'}`}
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
            {!readOnly && (
              <th className="th-action w-16 px-3 py-2.5">
                Action
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td className="px-3 py-2.5 text-center whitespace-nowrap">
                {index + 1}
              </td>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-3 py-2.5 text-${col.align || 'left'} cell-truncate`}
                  title={typeof row[col.key] === 'string' ? row[col.key] : undefined}
                >
                  {col.render ? col.render(row[col.key], row, index) : row[col.key]}
                </td>
              ))}
              {!readOnly && (
                <td className="td-action px-3 py-2.5 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onRowRemove?.(index)}
                    disabled={!canRemove}
                    className={`
                      text-red-500 hover:text-red-700 text-lg font-bold
                      ${!canRemove ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    title="Remove Item"
                  >
                    ×
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Badge Component for Stock/Unit display
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default',
  className = '' 
}) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700'
  };

  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
