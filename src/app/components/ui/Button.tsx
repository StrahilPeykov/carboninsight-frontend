/**
 * Button component provides a flexible, accessible button with multiple variants and sizes.
 * Supports loading states, custom ARIA attributes, and follows design system patterns.
 * Used throughout the application for user interactions and form submissions.
 */

import { ButtonHTMLAttributes, ReactNode } from "react";

// Interface extending native button attributes with custom props
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode; // Button content (text, icons, etc.)
  variant?: "primary" | "secondary" | "outline" | "icon"; // Visual style variants
  size?: "sm" | "md" | "lg"; // Size options for different contexts
  loading?: boolean; // Shows loading spinner when true
  ariaLabel?: string; // Custom accessible label
  ariaPressed?: boolean; // For toggle buttons
  ariaExpanded?: boolean; // For dropdown/collapsible buttons
  ariaControls?: string; // ID of element this button controls
  ariaDescribedBy?: string; // ID of element that describes this button
}

/**
 * Reusable Button component with accessibility features and design variants
 * @param children - Content to display inside the button
 * @param variant - Visual style: primary (red), secondary (gray), outline, or icon
 * @param size - Button size: sm, md, or lg
 * @param loading - When true, shows loading spinner and disables interaction
 * @param disabled - Native disabled state
 * @param className - Additional CSS classes
 * @param ariaLabel - Custom accessible label for screen readers
 * @param ariaPressed - ARIA pressed state for toggle buttons
 * @param ariaExpanded - ARIA expanded state for dropdown buttons
 * @param ariaControls - ID of element controlled by this button
 * @param ariaDescribedBy - ID of element describing this button
 * @param type - HTML button type (button, submit, reset)
 * @param props - Additional HTML button attributes
 * @returns Styled button element with accessibility features
 */
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
  // Base styles applied to all button variants
  const baseStyles =
    "rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2 inline-flex items-center justify-center";

  // Variant-specific styling for different button types
  const variantStyles = {
    primary:
      "bg-red text-white hover:bg-red-700 focus:ring-red-500 focus-visible:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 focus-visible:ring-gray-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed",
    outline:
      "border-2 border-gray-500 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500 focus-visible:ring-gray-500 dark:border-gray-400 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed",
    icon: "p-2 rounded hover:bg-gray-100 focus:ring focus:ring-red-500 focus-visible:ring focus-visible:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px] min-h-[44px]",
  };

  // Size-specific styling for different use cases
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm min-h-[36px]",
    md: "px-4 py-2 text-base min-h-[44px]",
    lg: "px-6 py-3 text-lg min-h-[48px]",
  };

  // Focus-visible polyfill styles for better keyboard navigation
  const focusVisibleStyles =
    "focus:not(:focus-visible):ring-0 focus:not(:focus-visible):ring-offset-0";

  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles[variant]} ${variant !== "icon" ? sizeStyles[size] : ""} ${focusVisibleStyles} ${className}`}
      disabled={disabled || loading} // Disable when explicitly disabled or loading
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading} // Indicates loading state to assistive technology
      aria-disabled={disabled || loading}
      {...props}
    >
      {/* Loading spinner displayed when button is in loading state */}
      {loading && (
        <>
          <span className="sr-only">Loading, please wait</span>
          <span className="loading-spinner mr-2" aria-hidden="true" />
        </>
      )}
      {children}
    </button>
  );
}
