// src/components/form/ViewSection.tsx
import React from 'react';

interface ViewFieldProps {
  label: string;
  value: React.ReactNode;
  span?: 1 | 2 | 3 | 4;
}

export const ViewField: React.FC<ViewFieldProps> = ({ label, value, span = 1 }) => {
  const spanClass = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4'
  };

  return (
    <div className={spanClass[span]}>
      <dt className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </dt>
      <dd className="text-[13px] text-gray-900 font-medium">
        {value || '—'}
      </dd>
    </div>
  );
};

interface ViewSectionProps {
  children: React.ReactNode;
  title?: string;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const ViewSection: React.FC<ViewSectionProps> = ({ 
  children, 
  title,
  columns = 3,
  className = '' 
}) => {
  const gridClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-xl mb-5 ${className}`}>
      {title && (
        <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-200 rounded-t-xl">
          <h2 className="text-slate-800 text-[14px] font-semibold">{title}</h2>
        </div>
      )}
      <div className={`p-5 ${title ? '' : `grid ${gridClass[columns]} gap-x-6 gap-y-4`}`}>
        {children}
      </div>
    </div>
  );
};

// Status Banner for View Forms
interface StatusBannerProps {
  status: string;
  color: string;
  icon?: React.ReactNode;
  metadata?: {
    label: string;
    value: string;
  }[];
}

export const StatusBanner: React.FC<StatusBannerProps> = ({ 
  status, 
  color, 
  icon,
  metadata = [] 
}) => {
  return (
    <div 
      className="rounded-[10px] p-5 mb-6"
      style={{ backgroundColor: color }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="text-white text-3xl">
              {icon}
            </div>
          )}
          <div>
            <div className="text-white/70 text-[11px] font-medium uppercase tracking-wide mb-1">
              Status
            </div>
            <div className="text-white text-2xl font-bold">
              {status}
            </div>
          </div>
        </div>
        {metadata.length > 0 && (
          <div className="flex items-center gap-6">
            {metadata.map((item, index) => (
              <div key={index} className="text-right">
                <div className="text-white/70 text-[11px] font-medium uppercase tracking-wide mb-1">
                  {item.label}
                </div>
                <div className="text-white text-sm font-semibold">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
