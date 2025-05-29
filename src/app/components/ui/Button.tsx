import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "icon";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  ariaLabel?: string;
  ariaPressed?: boolean;
  ariaExpanded?: boolean;
  ariaControls?: string;
  ariaDescribedBy?: string;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  loading,
  ariaLabel,
  ariaPressed,
  ariaExpanded,
  ariaControls,
  ariaDescribedBy,
  type = "button",
  ...props
}: ButtonProps) {
  const baseStyles =
    "rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2 inline-flex items-center justify-center";

  const variantStyles = {
    primary:
      "bg-red text-white hover:bg-red-700 focus:ring-red-500 focus-visible:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 focus-visible:ring-gray-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed",
    outline:
      "border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500 focus-visible:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed",
    icon: "p-2 rounded hover:bg-gray-100 focus:ring focus:ring-red-500 focus-visible:ring focus-visible:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px] min-h-[44px]",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm min-h-[36px]",
    md: "px-4 py-2 text-base min-h-[44px]",
    lg: "px-6 py-3 text-lg min-h-[48px]",
  };

  // Add focus-visible polyfill styles
  const focusVisibleStyles =
    "focus:not(:focus-visible):ring-0 focus:not(:focus-visible):ring-offset-0";

  // Ensure we have an accessible label
  const accessibleLabel = ariaLabel || (typeof children === "string" ? children : undefined);

  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles[variant]} ${variant !== "icon" ? sizeStyles[size] : ""} ${focusVisibleStyles} ${className}`}
      disabled={disabled || loading}
      aria-label={accessibleLabel}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <>
          <span className="sr-only">Loading, please wait</span>
          <span className="loading-spinner mr-2" aria-hidden="true" />
        </>
      )}
      {variant === "icon" && !accessibleLabel && <span className="sr-only">Button action</span>}
      {children}
    </button>
  );
}
