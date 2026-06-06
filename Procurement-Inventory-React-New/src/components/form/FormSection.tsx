// src/components/form/FormSection.tsx
import React from 'react';

interface FormSectionProps {
  icon?: React.ReactNode;
  title: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  icon,
  title,
  headerAction,
  children,
  className = ''
}) => {
  return (
    <div className={`bg-white border-[0.5px] border-gray-300 rounded-[10px] mb-5 ${className}`}>
      {/* Section Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-[10px] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="text-gray-600 text-lg">
              {icon}
            </span>
          )}
          <h2 className="text-gray-800 text-[15px] font-semibold">
            {title}
          </h2>
        </div>
        {headerAction && (
          <div>
            {headerAction}
          </div>
        )}
      </div>

      {/* Section Body */}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};
