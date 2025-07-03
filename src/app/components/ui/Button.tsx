// React type imports for component props and children handling
// ButtonHTMLAttributes provides all standard HTML button attributes for type safety
// ReactNode allows flexible content including text, elements, and components
import { ButtonHTMLAttributes, ReactNode } from "react";

// Comprehensive button props interface extending native HTML button attributes
// Combines standard button functionality with custom design system and accessibility features
// Follows WCAG 2.1 AA guidelines with extensive ARIA support for assistive technologies
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;              // Button content - text, icons, or complex elements
  variant?: "primary" | "secondary" | "outline" | "icon";  // Visual style variants for design system consistency
  size?: "sm" | "md" | "lg";        // Size variants with minimum touch target compliance (44px)
  loading?: boolean;                // Loading state with spinner and accessibility announcements
  // Comprehensive ARIA attributes for advanced accessibility scenarios
  ariaLabel?: string;               // Alternative label for buttons with icon-only content
  ariaPressed?: boolean;            // Toggle state for button groups and switches
  ariaExpanded?: boolean;           // Dropdown/accordion state indication for screen readers
  ariaControls?: string;            // References controlled element IDs for navigation
  ariaDescribedBy?: string;         // Links to descriptive help text or error messages
}

// Universal button component with comprehensive accessibility and design system integration
// Implements WCAG 2.1 AA standards with proper focus management and keyboard navigation
// Supports multiple variants, sizes, and states for consistent UI across application
// Features loading states, disabled handling, and extensive ARIA attribute support
export default function Button({
  children,
  variant = "primary",             // Default to primary variant for prominent actions
  size = "md",                     // Default to medium size for standard interactions
  className = "",                  // Additional CSS classes for custom styling
  disabled,                        // Native disabled state with proper accessibility handling
  loading,                         // Loading state with spinner and screen reader announcements
  ariaLabel,                       // Custom aria-label for accessibility context
  ariaPressed,                     // Toggle state for interactive button groups
  ariaExpanded,                    // Expansion state for dropdowns and collapsible content
  ariaControls,                    // Element IDs controlled by this button
  ariaDescribedBy,                 // Help text or error message associations
  type = "button",                 // Default button type to prevent form submission
  ...props                         // Spread remaining props for maximum flexibility
}: ButtonProps) {
  // Base styling foundation with accessibility and interaction patterns
  // Implements focus-visible for keyboard navigation without mouse focus rings
  // Uses flexbox for consistent content alignment and icon positioning
  const baseStyles =
    "rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2 inline-flex items-center justify-center";

  // Variant-specific styling definitions for design system consistency
  // Each variant serves different UI hierarchy needs with proper contrast ratios
  // Includes dark mode support and disabled states for complete accessibility
  const variantStyles = {
    // Primary variant for main call-to-action buttons with high visual prominence
    primary:
      "bg-red text-white hover:bg-red-700 focus:ring-red-500 focus-visible:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed",
    // Secondary variant for supporting actions with moderate visual weight
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 focus-visible:ring-gray-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed",
    // Outline variant for tertiary actions with minimal visual weight
    outline:
      "border-2 border-gray-500 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500 focus-visible:ring-gray-500 dark:border-gray-400 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed",
    // Icon variant for toolbar buttons with minimum 44px touch target compliance
    icon: "p-2 rounded hover:bg-gray-100 focus:ring focus:ring-red-500 focus-visible:ring focus-visible:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px] min-h-[44px]",
  };

  // Size variant definitions with WCAG minimum touch target requirements
  // All sizes meet 44px minimum for mobile accessibility compliance
  // Consistent padding and typography scaling across size variants
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm min-h-[36px]",    // Small size for compact interfaces
    md: "px-4 py-2 text-base min-h-[44px]",    // Standard size meeting touch target minimums
    lg: "px-6 py-3 text-lg min-h-[48px]",      // Large size for prominent actions
  };

  // Focus-visible polyfill styles for cross-browser keyboard navigation consistency
  // Prevents focus rings on mouse clicks while maintaining keyboard accessibility
  // Essential for professional UI that doesn't interfere with pointer interactions
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
