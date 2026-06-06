// src/components/form/StatsHeader.tsx
import React from 'react';

interface StatChip {
  label: string;
  value: string | number;
}

interface StatsHeaderProps {
  accentColor: string;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  statusBadge?: {
    label: string;
    color: string;
  };
  stats?: StatChip[];
  actions?: React.ReactNode;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({
  accentColor,
  icon,
  title,
  subtitle,
  statusBadge,
  stats = [],
  actions
}) => {
  return (
    <div 
      className="rounded-[10px] p-5 mb-6"
      style={{ backgroundColor: accentColor }}
    >
      {/* Top Row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="text-white text-2xl mt-0.5">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-white text-xl font-semibold leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-white/80 text-sm mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {actions && (
            <div>
              {actions}
            </div>
          )}
          {statusBadge && (
            <span 
              className="px-3 py-1 rounded-md text-xs font-medium"
              style={{ 
                backgroundColor: statusBadge.color,
                color: '#fff'
              }}
            >
              {statusBadge.label}
            </span>
          )}
        </div>
      </div>

      {/* Stats Row */}
      {stats.length > 0 && (
        <div className="flex items-center gap-0 bg-white/10 rounded-lg overflow-hidden">
          {stats.map((stat, index) => (
            <React.Fragment key={index}>
              <div className="flex-1 px-4 py-3 text-center">
                <div className="text-white/70 text-[11px] font-medium uppercase tracking-wide mb-1">
                  {stat.label}
                </div>
                <div className="text-white text-lg font-semibold">
                  {stat.value}
                </div>
              </div>
              {index < stats.length - 1 && (
                <div className="w-[1px] h-10 bg-white/20" />
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
