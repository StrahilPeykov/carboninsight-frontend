import { ReactNode } from "react";

interface EmptyStateProps {
  message: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  description?: string;
}

export default function EmptyState({ message, icon, action, description }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4" role="status" aria-live="polite">
      {icon && (
        <div className="mb-4 flex justify-center" aria-hidden="true">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{message}</h3>

      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red min-h-[44px]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
