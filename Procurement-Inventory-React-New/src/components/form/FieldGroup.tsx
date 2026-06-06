// src/components/form/FieldGroup.tsx
import React from 'react';

interface FieldGroupProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export const FieldGroup: React.FC<FieldGroupProps> = ({
  label,
  required = false,
  error,
  hint,
  children,
  className = ''
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-slate-700 mb-1.5 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-slate-500 mt-1">
          {hint}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  readOnly?: boolean;
}

export const Input: React.FC<InputProps> = ({ 
  readOnly = false, 
  className = '', 
  ...props 
}) => {
  return (
    <input
      className={`
        w-full px-3 py-2 text-sm border-[0.5px] border-slate-300 rounded-md
        focus:outline-none focus:ring-1 focus:ring-current focus:border-current
        ${readOnly ? 'bg-slate-100 text-slate-600 cursor-not-allowed' : 'bg-white'}
        ${className}
      `}
      readOnly={readOnly}
      disabled={readOnly}
      {...props}
    />
  );
};

// Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  readOnly?: boolean;
}

export const Select: React.FC<SelectProps> = ({ 
  readOnly = false, 
  className = '', 
  children,
  ...props 
}) => {
  return (
    <select
      className={`
        w-full px-3 py-2 text-sm border-[0.5px] border-slate-300 rounded-md
        focus:outline-none focus:ring-1 focus:ring-current focus:border-current
        ${readOnly ? 'bg-slate-100 text-slate-600 cursor-not-allowed' : 'bg-white'}
        ${className}
      `}
      disabled={readOnly}
      {...props}
    >
      {children}
    </select>
  );
};

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  readOnly?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({ 
  readOnly = false, 
  className = '', 
  ...props 
}) => {
  return (
    <textarea
      className={`
        w-full px-3 py-2 text-sm border-[0.5px] border-slate-300 rounded-md
        focus:outline-none focus:ring-1 focus:ring-current focus:border-current
        resize-none
        ${readOnly ? 'bg-slate-100 text-slate-600 cursor-not-allowed' : 'bg-white'}
        ${className}
      `}
      readOnly={readOnly}
      disabled={readOnly}
      {...props}
    />
  );
};

// Toggle Component
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ 
  checked, 
  onChange, 
  disabled = false 
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2
        ${checked ? 'bg-current' : 'bg-gray-300'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
};
