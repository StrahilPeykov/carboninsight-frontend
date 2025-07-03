// Next.js directive to force client-side rendering for this component
// Required because the navbar uses browser-specific APIs like localStorage, sessionStorage,
// and window events for state management and user interactions
// Also needed for proper router functionality and authentication state handling
"use client";

// Next.js optimized Link component for client-side navigation
// Provides prefetching, code splitting, and performance optimizations
// Essential for maintaining SPA behavior while preserving SEO benefits
import Link from "next/link";
// Next.js optimized Image component for responsive images and performance
// Provides automatic optimization, lazy loading, and responsive image handling
// Includes built-in WebP support and automatic size optimization
import Image from "next/image";
// Next.js router hook for programmatic navigation between pages
// Provides client-side routing with support for redirects and navigation control
// Used for handling complex navigation flows and conditional routing
import { useRouter } from "next/navigation";
// Custom hook that encapsulates all navbar state management logic
// Centralizes authentication, company selection, menu states, and user interactions
// Provides a clean separation of concerns between UI and business logic
import { useNavbarState } from "./useNavbarState";
// Utility function for safely setting localStorage items with error handling
// Abstracts localStorage operations and provides consistent error handling
// Ensures data persistence across browser sessions and page reloads
import { setLocalStorageItem } from "@/lib/api/apiClient";
// Mobile-specific navbar component for responsive design
// Handles navigation on smaller screens with touch-friendly interactions
// Provides slide-out menu functionality optimized for mobile devices
import NavbarMobile from "./NavbarMobile";
// Desktop-specific navbar component for larger screens
// Handles navigation on desktop with hover states and dropdown menus
// Optimized for mouse and keyboard interactions
import NavbarDesktop from "./NavbarDesktop";

// Main navigation component that appears at the top of every page in the application
// Provides site navigation, user authentication controls, company selection, and responsive design
// Integrates with onboarding tours, handles complex state management, and supports both mobile and desktop layouts
// Implements accessibility best practices including ARIA labels, keyboard navigation, and screen reader support
export default function Navbar() {
  // Next.js router instance for programmatic navigation throughout the application
  // Used for handling complex routing scenarios, redirects, and navigation based on user state
  // Enables dynamic routing decisions based on authentication status and company selection
  const router = useRouter();
  
  // Custom hook that manages all navbar-related state and provides handler functions
  // Encapsulates complex state logic including authentication, company management, and UI state
  // Returns both state variables and action handlers for clean component structure
  const navbarState = useNavbarState();

  // Destructure all state variables and handler functions from the navbar state hook
  // This provides access to authentication status, menu states, company data, and user information
  // Also includes action handlers for menu toggles, logout, and navigation functions
  const {
    // UI state variables for controlling menu visibility and interactions
    isMenuOpen,          // Controls mobile hamburger menu visibility
    isProfileMenuOpen,   // Controls user profile dropdown menu state
    isCompanyMenuOpen,   // Controls company selection dropdown menu state
    
    // Core application state related to companies and user context
    companyId,          // Currently selected company identifier
    allCompanies,       // Array of all companies the user has access to
    mounted,            // Boolean indicating if component has mounted (hydration safety)
    
    // User authentication and profile information
    user,               // Current user object with profile information
    isAuthenticated,    // Boolean indicating if user is logged in
    isLoading,          // Boolean indicating if authentication state is loading
    
    // Navigation and routing state
    pathname,           // Current page path for active link highlighting
    
    // Action handlers for menu interactions and state management
    toggleMenu,         // Function to toggle mobile hamburger menu
    toggleProfileMenu,  // Function to toggle user profile dropdown
    toggleCompanyMenu,  // Function to toggle company selection dropdown
    handleLogout,       // Function to handle user logout process
    
    // State setters for direct menu control (used by child components)
    setIsMenuOpen,      // Direct setter for mobile menu state
    setIsProfileMenuOpen, // Direct setter for profile menu state
    setIsCompanyMenuOpen, // Direct setter for company menu state
    
    // Utility functions for navigation and user interface
    isActive,           // Function to determine if a navigation link is active
    getUserDisplayName, // Function to get formatted user display name
  } = navbarState;

  // Handler function for creating a new company with tour integration
  // Checks for active onboarding tours and dispatches appropriate tour events
  // Integrates with the application's guided tour system for new user onboarding
  const handleCreateCompany = () => {
    // Check if user is currently in the main onboarding tour
    // sessionStorage is used for tour state to persist across page navigations
    const activeTour = sessionStorage.getItem("activeTour");
    
    // If user is in onboarding tour, dispatch custom event to guide tour progression
    // This allows the tour system to react to user actions and provide contextual guidance
    if (activeTour === "main-onboarding") {
      // Dispatch custom window event with tour action details
      // The tour system listens for these events to manage tour state and progression
      window.dispatchEvent(
        new CustomEvent("tourAction", {
          detail: { action: "navigate-to-create-company" },
        })
      );
    }
    
    // Navigate to company creation page using Next.js router
    // This provides client-side navigation with proper state management
    router.push("/create-company");
  };

  // Generic navigation handler with optional tour integration
  // Provides a centralized way to handle navigation while supporting guided tours
  // Allows for consistent tour event dispatching across different navigation actions
  const handleNavigation = (path: string, tourAction?: string) => {
    // Check for active tour state to determine if tour events should be dispatched
    // This pattern allows for consistent tour integration across all navigation actions
    const activeTour = sessionStorage.getItem("activeTour");
    
    // Conditionally dispatch tour events if user is in an active tour
    // The tourAction parameter allows for specific tour progression tracking
    if (activeTour && tourAction) {
      // Dispatch custom event with specific tour action for tour system integration
      // This enables the tour to respond appropriately to user navigation choices
      window.dispatchEvent(
        new CustomEvent("tourAction", {
          detail: { action: tourAction },
        })
      );
    }
    
    // Execute the actual navigation using Next.js router
    // Provides client-side routing with proper state management and performance optimization
    router.push(path);
  };

  // Handler function for company selection with comprehensive state management
  // Manages localStorage persistence, event dispatching, and conditional navigation
  // Ensures proper state synchronization across the entire application
  const handleCompanySelect = (selectedCompanyId: string) => {
    // Persist the selected company ID to localStorage for session persistence
    // This ensures the company selection survives page reloads and browser sessions
    setLocalStorageItem("selected_company_id", selectedCompanyId);

    // Dispatch custom events to notify other components of company selection changes
    // Uses strategic timing delays to ensure proper event processing order
    // This pattern prevents race conditions and ensures reliable state updates
    if (typeof window !== "undefined") {
      // First event: notify components that the company list state has changed
      // Short delay ensures localStorage update completes before event dispatch
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("companyListChanged"));
      }, 10);

      // Second event: notify components that the selected company has changed
      // Slightly longer delay ensures proper event processing sequence
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("companyChanged"));
      }, 20);
    }

    // Conditional navigation logic based on current page and company state
    // Redirects users to appropriate pages after company selection
    // Handles edge cases for company list page and dashboard navigation
    if (pathname === "/list-companies" || (!companyId && pathname === "/")) {
      // Navigate to dashboard when selecting company from list or when no company was previously selected
      // This provides a smooth user experience after company selection
      router.push("/dashboard");
    }
  };

  // Handler function for navigating to company settings page
  // Ensures company ID is properly set before navigation
  // Provides safety checks to prevent navigation without valid company context
  const handleCompanySettings = () => {
    // Verify that a company is currently selected before allowing navigation
    // This prevents users from accessing settings without proper company context
    if (companyId) {
      // Ensure the company ID is persisted in localStorage before navigation
      // This guarantees that the settings page has access to the correct company data
      setLocalStorageItem("selected_company_id", companyId);
      
      // Navigate to company details/settings page
      // Uses Next.js router for client-side navigation with proper state management
      router.push("/company-details");
    }
  };

  // Handler function for navigating to user management page
  // Includes company context validation and localStorage state management
  // Ensures proper authorization context for user management operations
  const handleManageUsers = () => {
    // Validate that a company is selected before allowing access to user management
    // User management operations require valid company context for proper authorization
    if (companyId) {
      // Persist company ID to ensure user management page has proper context
      // This prevents issues with page reloads or direct URL access
      setLocalStorageItem("selected_company_id", companyId);
      
      // Navigate to user management page with proper company context
      // Provides access to user administration features for the selected company
      router.push("/manage-user");
    }
  };

  // Handler function for navigating to data sharing settings page
  // Manages company context and ensures proper navigation with state persistence
  // Provides access to product data sharing configuration for the selected company
  const handleDataSharing = () => {
    // Ensure a valid company is selected before accessing data sharing settings
    // Data sharing operations require proper company context for security and functionality
    if (companyId) {
      // Persist company selection to localStorage for session continuity
      // This ensures the data sharing page maintains proper company context
      setLocalStorageItem("selected_company_id", companyId);
      
      // Navigate to product data sharing configuration page
      // Provides access to data sharing settings and permissions for the selected company
      router.push("/product-data-sharing");
    }
  };

  return (
    <>
      <nav
        className="sticky top-0 z-50 h-16 bg-white shadow-sm dark:bg-gray-900"
        role="navigation"
        aria-label="Main navigation"
        id="main-navigation"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo and brand */}
            <div className="flex-shrink-0 flex items-center min-w-0">
              <Link
                href="/"
                className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red rounded-md pr-2 sm:pr-4"
                aria-label="CarbonInsight - Home"
              >
                <Image
                  src="/brainport-logo-white.webp"
                  alt="CarbonInsight"
                  width={32}
                  height={32}
                  className="hidden dark:block flex-shrink-0"
                />
                <Image
                  src="/brainport-logo.webp"
                  alt="CarbonInsight"
                  width={32}
                  height={32}
                  className="block dark:hidden flex-shrink-0"
                />
                <span className="text-lg sm:text-xl font-bold truncate">
                  <span className="sm:hidden">CI</span>
                  <span className="hidden sm:inline">CarbonInsight</span>
                </span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red min-w-[44px] min-h-[44px]"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              >
                <span className="sr-only">{isMenuOpen ? "Close main menu" : "Open main menu"}</span>
                <svg
                  className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <svg
                  className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Desktop menu */}
            <NavbarDesktop
              isAuthenticated={isAuthenticated}
              mounted={mounted}
              companyId={companyId}
              allCompanies={allCompanies}
              isCompanyMenuOpen={isCompanyMenuOpen}
              isProfileMenuOpen={isProfileMenuOpen}
              user={user}
              isActive={isActive}
              onToggleCompanyMenu={toggleCompanyMenu}
              onToggleProfileMenu={toggleProfileMenu}
              onCloseCompanyMenu={() => setIsCompanyMenuOpen(false)}
              onCloseProfileMenu={() => setIsProfileMenuOpen(false)}
              onCompanySelect={handleCompanySelect}
              onCreateCompany={handleCreateCompany}
              onCompanySettings={handleCompanySettings}
              onManageUsers={handleManageUsers}
              onDataSharing={handleDataSharing}
              onLogout={handleLogout}
              onNavigation={handleNavigation}
              getUserDisplayName={getUserDisplayName}
            />
          </div>
        </div>

        {/* Mobile menu */}
        <NavbarMobile
          isOpen={isMenuOpen}
          isAuthenticated={isAuthenticated}
          mounted={mounted}
          companyId={companyId}
          allCompanies={allCompanies}
          isActive={isActive}
          onClose={() => setIsMenuOpen(false)}
          onCompanySelect={handleCompanySelect}
          onCreateCompany={handleCreateCompany}
          onCompanySettings={handleCompanySettings}
          onManageUsers={handleManageUsers}
          onDataSharing={handleDataSharing}
          onLogout={handleLogout}
          onNavigation={handleNavigation}
        />
      </nav>
    </>
  );
}
