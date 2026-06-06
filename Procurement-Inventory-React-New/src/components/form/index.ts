// src/components/form/index.ts
// Universal Form Design System - Export all components

export { StatsHeader } from './StatsHeader';
export { FormSection } from './FormSection';
export { FieldGroup, Input, Select, Textarea, Toggle } from './FieldGroup';
export { DynamicTable, Badge } from './DynamicTable';
export type { TableColumn } from './DynamicTable';
export { ViewSection, ViewField, StatusBanner } from './ViewSection';
export { FilterBar, FilterField } from './FilterBar';
export { FormActions, ActionButton } from './FormActions';

// Color Palette Constants
export const COLORS = {
  REQUISITION: '#534AB7',    // Purple
  PURCHASE: '#1D9E75',       // Teal
  SALES: '#BA7517',          // Amber
  CUSTOMER: '#D85A30',       // Coral
  EMPLOYEE: '#D85A30',       // Coral
  INVENTORY: '#185FA5',      // Blue
  STOCK: '#185FA5',          // Blue
  REPORTS: '#5F5E5A',        // Gray
  QUALITY: '#7C3AED',        // Violet
  SUPPLIER: '#059669',       // Emerald
  DELIVERY: '#2563EB',       // Blue
  RETURN: '#DC2626',         // Red
  DAMAGE: '#EA580C',         // Orange
  STORE: '#0891B2',          // Cyan
  RFQ: '#8B5CF6',            // Purple
  CS: '#10B981',             // Green
};
