// src/components/form/FormActions.tsx
import React from 'react';

interface FormActionsProps {
  onDiscard?: () => void;
  onSaveDraft?: () => void;
  onSubmit?: () => void;
  discardLabel?: string;
  saveDraftLabel?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  accentColor?: string;
  className?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onDiscard,
  onSaveDraft,
  onSubmit,
  discardLabel = 'Discard',
  saveDraftLabel = 'Save Draft',
  submitLabel = 'Submit',
  isSubmitting = false,
  accentColor = '#534AB7',
  className = ''
}) => {
  // Generate lighter version of accent color for Save Draft button
  const getLightAccent = (color: string) => {
    // Simple opacity-based light version
    return `${color}20`;
  };

  return (
    <div className={`flex items-center justify-between pt-5 border-t border-gray-200 mt-6 ${className}`}>
      {/* Left: Discard */}
      <div>
        {onDiscard && (
          <button
            type="button"
            onClick={onDiscard}
            disabled={isSubmitting}
            className="px-5 py-2.5 border-[0.5px] border-gray-300 text-gray-700 text-[13px] font-medium rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {discardLabel}
          </button>
        )}
      </div>

      {/* Right: Save Draft + Submit */}
      <div className="flex items-center gap-3">
        {onSaveDraft && (
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-[13px] font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: getLightAccent(accentColor),
              color: accentColor,
              border: `0.5px solid ${accentColor}40`
            }}
          >
            {saveDraftLabel}
          </button>
        )}
        {/* Always show submit button if submitLabel is provided, even without onSubmit handler */}
        {(onSubmit || submitLabel) && (
          <button
            type="submit"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-white text-[13px] font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: accentColor
            }}
          >
            {isSubmitting ? 'Submitting...' : submitLabel}
          </button>
        )}
      </div>
    </div>
  );
};

// Action Buttons for View Forms (Approve, Reject, etc.)
interface ActionButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'secondary';
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  icon
}) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-[0.5px] border-gray-300'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        px-5 py-2.5 text-[13px] font-medium rounded-md transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center gap-2
        ${variants[variant]}
      `}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
};
