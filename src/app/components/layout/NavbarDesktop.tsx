// Client-side component directive for Next.js App Router
// This component handles all client-side interactions and state management
"use client";

// React hooks for DOM references and side effects
import { useRef, useEffect } from "react";
// Next.js optimized Link component for client-side navigation
import Link from "next/link";
// Lucide React icons for consistent iconography throughout the navbar
// LayoutDashboardIcon: Dashboard navigation button
// Boxes: Product list navigation button
// SettingsIcon: Account settings menu item
// HelpCircle: Support menu item
// ChevronDown: Dropdown indicator for user profile menu
import { LayoutDashboardIcon, Boxes, SettingsIcon, HelpCircle, ChevronDown } from "lucide-react";
// Custom button component with consistent styling and accessibility features
import Button from "../ui/Button";
// Theme selection component for light/dark mode switching
import ThemeSelector from "../ui/ThemeSelector";
// Help menu component with support resources and documentation links
import HelpMenu from "../HelpMenu";
// Company selector dropdown component for multi-tenant organization switching
import CleanCompanySelector from "./CompanySelector";

// Company data structure for multi-tenant organization management
// Used in dropdown selector and company switching functionality
// Simple interface with minimal required fields for display and selection
interface Company {
  id: string;
  name: string;
}

// User profile data structure containing authentication and display information
// Supports flexible naming conventions with fallback to username
// Optional first/last names accommodate various user registration flows
interface User {
  first_name?: string;  // Optional first name for personalized display
  last_name?: string;   // Optional last name for full name construction
  username: string;     // Required username as fallback for display
  email: string;        // Email address for profile display and identification
}

// Comprehensive props interface for desktop navigation component
// Handles authentication state, company management, user interactions, and menu controls
// Follows React best practices with callback props for state management in parent
interface DesktopNavProps {
  // Authentication and hydration state management
  isAuthenticated: boolean;     // Controls visibility of authenticated vs. public navigation
  mounted: boolean;             // Prevents hydration mismatch by waiting for client-side mount
  
  // Company context and multi-tenant management
  companyId: string | null;     // Currently selected company ID, null when no company selected
  allCompanies: Company[];      // Complete list of companies user has access to
  
  // Menu state management (controlled by parent component)
  isCompanyMenuOpen: boolean;   // Company selector dropdown open/closed state
  isProfileMenuOpen: boolean;   // User profile menu dropdown open/closed state
  
  // User profile information for display and personalization
  user: User | null;            // Current user data, null when not authenticated
  
  // Navigation helper functions
  isActive: (path: string) => boolean;  // Determines if current route matches given path for styling
  
  // Company-related event handlers for multi-tenant functionality
  onToggleCompanyMenu: () => void;      // Opens/closes company selector dropdown
  onToggleProfileMenu: () => void;      // Opens/closes user profile menu dropdown
  onCloseCompanyMenu: () => void;       // Explicitly closes company menu (for click outside)
  onCloseProfileMenu: () => void;       // Explicitly closes profile menu (for click outside)
  onCompanySelect: (companyId: string) => void;  // Handles company switching with ID
  onCreateCompany: () => void;          // Navigates to company creation flow
  onCompanySettings: () => void;        // Opens company configuration/settings
  onManageUsers: () => void;            // Opens user management for current company
  onDataSharing: () => void;            // Opens data sharing configuration
  
  // Authentication and navigation handlers
  onLogout: () => void;                 // Handles user logout and cleanup
  onNavigation: (path: string, tourAction?: string) => void;  // Custom navigation with tour integration
  
  // User display utilities
  getUserDisplayName: () => string;     // Returns formatted user display name with fallbacks
}

// Desktop navigation component for authenticated users
// Handles responsive design (hidden on mobile), company switching, user profile, and primary navigation
// Receives all state and handlers as props following React best practices for controlled components
export default function NavbarDesktop({
  isAuthenticated,
  mounted,
  companyId,
  allCompanies,
  isCompanyMenuOpen,
  isProfileMenuOpen,
  user,
  isActive,
  onToggleCompanyMenu,
  onToggleProfileMenu,
  onCloseCompanyMenu,
  onCloseProfileMenu,
  onCompanySelect,
  onCreateCompany,
  onCompanySettings,
  onManageUsers,
  onDataSharing,
  onLogout,
  onNavigation,
  getUserDisplayName,
}: DesktopNavProps) {
  // DOM references for click-outside detection and focus management
  // Essential for accessible dropdown menus and proper user interaction handling
  const profileMenuRef = useRef<HTMLDivElement>(null);      // References the profile dropdown container
  const profileButtonRef = useRef<HTMLButtonElement>(null); // References the profile trigger button

  // Click-outside handler for profile menu accessibility and UX
  // Implements proper dropdown behavior by closing menu when user clicks elsewhere
  // Follows WCAG guidelines for menu interactions and keyboard navigation support
  useEffect(() => {
    // Event handler that checks if click occurred outside both menu and trigger button
    // Prevents menu from closing when clicking the trigger button (handled by toggle)
    function handleClickOutside(event: MouseEvent) {
      if (
        isProfileMenuOpen &&
        profileMenuRef.current &&
        profileButtonRef.current &&
        !profileMenuRef.current.contains(event.target as Node) &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        onCloseProfileMenu();
      }
    }

    // Only attach listener when menu is open to optimize performance
    // Prevents unnecessary event listeners when menu is closed
    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup function to prevent memory leaks and ensure proper event listener removal
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen, onCloseProfileMenu]);

  // Early return for unauthenticated or unmounted state
  // Shows registration/login buttons for public users
  // Prevents hydration mismatch by checking mounted state
  if (!isAuthenticated || !mounted) {
    return (
      // Desktop-only container with responsive spacing and right alignment
      // Hidden on mobile devices where mobile navigation takes precedence
      <div className="hidden md:flex md:items-center md:space-x-2 lg:space-x-4 min-w-0 flex-1 justify-end">
        <Link href="/register" className="py-2 rounded-md text-sm font-bold">
          <Button size="md">Register</Button>
        </Link>
        <Link href="/login" className="py-2 rounded-md text-sm font-bold">
          <Button size="md">Login</Button>
        </Link>
      </div>
    );
  }

  // Main authenticated navigation container
  // Desktop-only responsive layout with proper spacing and right alignment
  // Contains primary navigation, company selector, help menu, and user profile
  return (
    <div className="hidden md:flex md:items-center md:space-x-2 lg:space-x-4 min-w-0 flex-1 justify-end">
      {/* Main Navigation */}
      {companyId && (
        <nav
          className="hidden md:flex md:items-center md:space-x-1 lg:space-x-2"
          role="navigation"
          aria-label="Primary navigation"
        >
          <button
            onClick={() => onNavigation("/dashboard", "navigate-to-dashboard")}
            className={`flex items-center px-2 lg:px-3 py-2 rounded-md text-sm font-medium min-h-[44px]
              ${
                isActive("/dashboard")
                  ? "bg-red text-white"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
              }`}
            aria-current={isActive("/dashboard") ? "page" : undefined}
            data-tour-target="dashboard-nav"
          >
            <LayoutDashboardIcon size={16} className="mr-1" aria-hidden="true" />
            <span className="hidden lg:inline">Dashboard</span>
          </button>

          <button
            onClick={() => onNavigation("/product-list", "navigate-to-products")}
            className={`flex items-center px-2 lg:px-3 py-2 rounded-md text-sm font-medium min-h-[44px]
              ${
                isActive("/product-list")
                  ? "bg-red text-white"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
              }`}
            aria-current={isActive("/product-list") ? "page" : undefined}
            data-tour-target="products-nav"
          >
            <Boxes size={16} className="mr-1" aria-hidden="true" />
            <span className="hidden lg:inline">Products</span>
          </button>
        </nav>
      )}

      {/* Company Selector */}
      <div className="flex-shrink-0 company-selector-wrapper">
        <CleanCompanySelector
          companies={allCompanies}
          currentCompanyId={companyId}
          onCompanySelect={onCompanySelect}
          onCreateCompany={onCreateCompany}
          onCompanySettings={onCompanySettings}
          onManageUsers={onManageUsers}
          onDataSharing={onDataSharing}
          isOpen={isCompanyMenuOpen}
          onToggle={onToggleCompanyMenu}
          onClose={onCloseCompanyMenu}
        />
      </div>

      {/* Help Menu - Desktop Only */}
      <div className="hidden sm:block">
        <HelpMenu />
      </div>

      {/* Profile Menu */}
      <div className="relative flex-shrink-0" ref={profileMenuRef}>
        <button
          ref={profileButtonRef}
          onClick={onToggleProfileMenu}
          className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red min-h-[44px] p-2"
          aria-expanded={isProfileMenuOpen}
          aria-haspopup="true"
          aria-label={`User account menu for ${getUserDisplayName()}`}
        >
          <span className="sr-only">Open user menu</span>
          <div
            className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700"
            aria-hidden="true"
          >
            <span aria-hidden="true">
              {user?.first_name?.charAt(0)?.toUpperCase() ||
                user?.username?.charAt(0)?.toUpperCase() ||
                "U"}
            </span>
          </div>
          <ChevronDown size={16} className="ml-1" aria-hidden="true" />
        </button>

        {isProfileMenuOpen && (
          <div className="origin-top-right absolute right-2 sm:right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700 z-50">
            {/* User Info Header */}
            <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
              <p className="font-medium truncate">{getUserDisplayName()}</p>
              <p className="text-gray-500 dark:text-gray-400 truncate text-xs">
                {user?.email}
              </p>
            </div>

            {/* Theme Selection */}
            <div className="border-b border-gray-200 dark:border-gray-700 theme-selector">
              <ThemeSelector />
            </div>

            {/* Account Links */}
            <Link
              href="/account"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 min-h-[44px] flex items-center"
              onClick={onCloseProfileMenu}
            >
              <SettingsIcon size={16} className="mr-2" aria-hidden="true" />
              Account Settings
            </Link>

            <Link
              href="/support"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 min-h-[44px] flex items-center"
              onClick={onCloseProfileMenu}
            >
              <HelpCircle size={16} className="mr-2" aria-hidden="true" />
              Support & Help
            </Link>

            {/* Sign Out */}
            <div className="border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  onCloseProfileMenu();  // Close menu first for clean UX
                  onLogout();           // Then perform logout action
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 min-h-[44px]"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
