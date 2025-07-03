// Next.js directive to force client-side rendering for this component
// Required because this component uses browser-specific APIs like localStorage, sessionStorage,
// DOM event listeners, and dynamic user interactions that are only available in the browser
// Also necessary for proper state management and interactive dropdown functionality
"use client";

// React hooks for state management, lifecycle control, and DOM element references
// useState: Manages local component state for search functionality and UI interactions
// useEffect: Handles side effects like focus management and click-outside detection
// useRef: Creates references to DOM elements for direct manipulation and event handling
import { useState, useEffect, useRef } from "react";
// Lucide React icon library for consistent iconography throughout the application
// Building2: Primary building/company icon for visual representation
// Search: Search functionality indicator for company filtering
// Settings: Company settings and configuration access
// Users: User management and team administration
// Plus: Add/create new company functionality
// Check: Selection confirmation indicator for current company
// ChevronDown: Dropdown state indicator with rotation animation
// Share2: Data sharing and collaboration features
import { Building2, Search, Settings, Users, Plus, Check, ChevronDown, Share2 } from "lucide-react";

// TypeScript interface defining the structure of a company object
// Provides type safety and IntelliSense support for company data throughout the component
// id: Unique identifier for each company (string format for API compatibility)
// name: Display name of the company for user interface
// avatar: Optional company logo/image URL for enhanced visual identification
interface Company {
  id: string;
  name: string;
  avatar?: string;
}

// Comprehensive TypeScript interface defining all props for the CompanySelector component
// This interface ensures type safety and provides clear documentation of component requirements
// Includes both data props and callback functions for complete component functionality
interface CleanCompanySelectorProps {
  // Data props for component state and display
  companies: Company[];                                    // Array of available companies for selection
  currentCompanyId: string | null;                        // ID of currently selected company (null if none selected)
  
  // Callback functions for user interactions and navigation
  onCompanySelect: (companyId: string) => void;          // Handles company selection with selected company ID
  onCreateCompany: () => void;                           // Navigates to company creation flow
  onCompanySettings: () => void;                         // Opens company settings/configuration page
  onManageUsers: () => void;                             // Opens user management interface
  onDataSharing: () => void;                             // Opens data sharing requests management
  
  // UI state control props for dropdown behavior
  isOpen: boolean;                                       // Controls dropdown visibility state
  onToggle: () => void;                                  // Toggles dropdown open/closed state
  onClose: () => void;                                   // Explicitly closes dropdown (used for cleanup)
}

// Main CleanCompanySelector component - a sophisticated dropdown interface for company management
// This component provides a comprehensive company selection and management interface including:
// - Company selection with visual feedback and search capabilities
// - Quick access to company management functions (settings, users, data sharing)
// - Company creation workflow integration
// - Responsive design with mobile-optimized interactions
// - Accessibility features including ARIA labels and keyboard navigation
// - Tour integration for user onboarding and feature discovery
export default function CleanCompanySelector({
  companies,
  currentCompanyId,
  onCompanySelect,
  onCreateCompany,
  onCompanySettings,
  onManageUsers,
  onDataSharing,
  isOpen,
  onToggle,
  onClose,
}: CleanCompanySelectorProps) {
  // Local state for search functionality within the company dropdown
  // Allows users to filter through large lists of companies efficiently
  // Cleared automatically when dropdown closes to ensure clean state
  const [searchQuery, setSearchQuery] = useState("");

  // DOM element references for advanced functionality and user experience
  // These refs enable direct DOM manipulation for focus management and click detection
  
  // Reference to the dropdown container for click-outside detection
  // Used to automatically close dropdown when user clicks elsewhere on the page
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Reference to the search input field for automatic focus management
  // Enhances user experience by focusing search field when dropdown opens
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Enhanced company lookup with robust type safety and string normalization
  // Finds the currently selected company from the companies array with defensive programming
  // Handles edge cases like null currentCompanyId and ensures string comparison consistency
  const currentCompany = companies.find(c => {
    // Convert both IDs to strings and trim whitespace for reliable comparison
    // This prevents issues with mixed number/string types and formatting inconsistencies
    const companyId = String(c.id).trim();
    const selectedId = String(currentCompanyId || "").trim();
    return companyId === selectedId;
  });

  // Conditional search field visibility based on company count
  // Only shows search functionality when there are many companies (>8)
  // Keeps UI clean and simple for users with few companies
  const shouldShowSearch = companies.length > 8;

  // Real-time company filtering based on user search input
  // Implements case-insensitive substring matching for intuitive search behavior
  // Filters company names dynamically as user types in search field
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Company selection handler with comprehensive state management
  // Manages the complete flow of company selection including logging, callbacks, and cleanup
  // Ensures proper state transitions and user feedback throughout the selection process
  const handleCompanySelect = (companyId: string) => {
    // Log selection for debugging and user behavior analytics
    // Helps with troubleshooting and understanding user interaction patterns
    console.log("Selecting company:", companyId);
    
    // Execute the parent component's selection callback with chosen company ID
    // This typically updates global application state and triggers navigation/data loading
    onCompanySelect(companyId);
    
    // Close the dropdown to complete the selection interaction
    // Provides clear visual feedback that selection has been completed
    onClose();
    
    // Clear search query to reset the dropdown state for future interactions
    // Ensures clean state when dropdown is reopened later
    setSearchQuery("");
  };

  // Navigation handler with integrated tour system support
  // Manages navigation between different company-related pages while respecting active tours
  // Provides seamless integration with user onboarding and feature discovery systems
  const handleNavigation = (path: string, tourAction?: string) => {
    // Check if there's an active user onboarding tour in progress
    // Tours guide new users through key features and workflows
    const activeTour = sessionStorage.getItem("activeTour");
    
    // If tour is active and a tour action is specified, dispatch tour event
    // This allows the tour system to respond to user actions and advance appropriately
    if (activeTour && tourAction) {
      window.dispatchEvent(
        new CustomEvent("tourAction", {
          detail: { action: tourAction },
        })
      );
    }
    
    // Close the dropdown as navigation will be handled by parent component
    // Parent component receives the onClose callback and handles actual navigation
    // This separation of concerns allows for flexible navigation management
    onClose();
  };

  // Utility function for intelligent text truncation with user experience considerations
  // Prevents UI layout issues while maintaining readability for long company names
  // Provides consistent text handling across different screen sizes and content lengths
  const truncateCompanyName = (name: string, maxLength: number = 20) => {
    // Return original name if it fits within the maximum length limit
    // Avoids unnecessary truncation for short names
    if (name.length <= maxLength) return name;
    
    // Truncate and add ellipsis for longer names to maintain layout consistency
    // Uses standard ellipsis convention to indicate truncated content
    return name.substring(0, maxLength) + "...";
  };

  // Effect for automatic search field focus management when dropdown opens
  // Enhances user experience by providing immediate keyboard access to search functionality
  // Only applies when search is visible and dropdown opens, with timing optimization
  useEffect(() => {
    // Check all conditions: dropdown is open, search should be shown, and input element exists
    // Multiple conditions ensure focus is only applied when appropriate and safe
    if (isOpen && shouldShowSearch && searchInputRef.current) {
      // Small delay ensures DOM is fully rendered before attempting focus
      // Prevents focus issues that can occur with rapid state changes
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, shouldShowSearch]);

  // Effect for click-outside detection with tour system integration
  // Automatically closes dropdown when user clicks elsewhere, but respects active tours
  // Provides intuitive user experience while maintaining tour functionality
  useEffect(() => {
    // Internal function to handle mouse click events for outside-click detection
    // Checks tour status and click location to determine if dropdown should close
    function handleClickOutside(event: MouseEvent) {
      // Check multiple indicators for active tour state
      // Tours may prevent automatic closing to maintain user guidance flow
      const isTourActive = document.body.classList.contains("tour-active");
      const activeTour = sessionStorage.getItem("activeTour");

      // Prevent auto-close during main onboarding tour to avoid interrupting user guidance
      // Tours require controlled interaction flow for effective user education
      if (isTourActive && activeTour === "main-onboarding") {
        return;
      }

      // Check if click occurred outside the dropdown container
      // Only close if click was truly outside to avoid closing on internal interactions
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Close dropdown and clear search state for clean next interaction
        onClose();
        setSearchQuery("");
      }
    }

    // Only add event listener when dropdown is open to optimize performance
    // Prevents unnecessary event processing when dropdown is closed
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup function to remove event listener and prevent memory leaks
    // Ensures proper cleanup when component unmounts or dropdown closes
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Company Selector Button */}
      <button
        onClick={() => onToggle()}
        className={`company-selector-button flex items-center px-3 py-2 rounded-md text-sm font-medium h-[44px] transition-all duration-200 min-w-0 max-w-full border
          ${
            currentCompany
              ? "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
          } focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
        style={{
          width: "clamp(120px, 20vw, 200px)",
          maxWidth: "100%",
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`${currentCompany ? `Current company: ${currentCompany.name}. Click to change or manage company.` : "No company selected. Click to select a company."}`}
      >
        <div className="flex items-center min-w-0 flex-1 overflow-hidden">
          {currentCompany?.avatar ? (
            <img
              src={currentCompany.avatar}
              alt=""
              className="w-4 h-4 rounded mr-2 flex-shrink-0"
            />
          ) : (
            <Building2
              size={14}
              className={`mr-2 flex-shrink-0 ${currentCompany ? "text-gray-600 dark:text-gray-400" : "text-gray-500"}`}
              aria-hidden="true"
            />
          )}
          <div className="min-w-0 flex-1 overflow-hidden">
            {currentCompany ? (
              <>
                <div
                  className="truncate text-sm font-semibold leading-tight min-w-0"
                  title={currentCompany.name}
                >
                  {currentCompany.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight -mt-0.5 truncate">
                  <span className="sm:hidden">Company</span>
                  <span className="hidden sm:inline">Current Company</span>
                </div>
              </>
            ) : (
              <span className="truncate text-sm">
                <span className="sm:hidden">Select</span>
                <span className="hidden sm:inline">Select Company</span>
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          size={12}
          className={`ml-1 sm:ml-2 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""} text-gray-500`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white dark:bg-gray-800 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-[10001] border border-gray-200 dark:border-gray-700">
          {/* Clear Header Section */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Select Company
            </h3>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={e => {
                  e.preventDefault();
                  if (currentCompanyId) {
                    onCompanySettings();
                    onClose();
                  } else {
                    console.log("No company selected for settings");
                  }
                }}
                disabled={!currentCompanyId}
                className="company-settings-button flex flex-col items-center p-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-white dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                title="Company Settings"
              >
                <Settings size={14} className="mb-1" />
                <span className="hidden sm:inline">Settings</span>
                <span className="sm:hidden text-[10px]">Set</span>
              </button>
              <button
                onClick={e => {
                  e.preventDefault();
                  if (currentCompanyId) {
                    onManageUsers();
                    onClose();
                  } else {
                    console.log("No company selected for users");
                  }
                }}
                disabled={!currentCompanyId}
                className="flex flex-col items-center p-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-white dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                title="Manage Users"
              >
                <Users size={14} className="mb-1" />
                <span className="hidden sm:inline">Users</span>
                <span className="sm:hidden text-[10px]">Use</span>
              </button>
              <button
                onClick={e => {
                  e.preventDefault();
                  if (currentCompanyId) {
                    onDataSharing();
                    onClose();
                  } else {
                    console.log("No company selected for data sharing");
                  }
                }}
                disabled={!currentCompanyId}
                className="flex flex-col items-center p-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-white dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                title="Data Sharing Requests"
              >
                <Share2 size={14} className="mb-1" />
                <span className="hidden sm:inline">Sharing</span>
                <span className="sm:hidden text-[10px]">Shr</span>
              </button>
              <button
                onClick={() => {
                  onCreateCompany();
                  onClose();
                }}
                className="flex flex-col items-center p-2 text-xs text-green-700 hover:text-green-800 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/30 rounded-md transition-colors border border-transparent hover:border-green-200 dark:hover:border-green-800"
                title="Create New Company"
                data-tour-target="create-company"
              >
                <Plus size={14} className="mb-1" />
                <span className="hidden sm:inline">Create</span>
                <span className="sm:hidden text-[10px]">New</span>
              </button>
            </div>
          </div>

          {/* Search (if many companies) */}
          {shouldShowSearch && (
            <div className="p-3 border-b border-gray-100 dark:border-gray-700">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search companies..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Company List */}
          <div className="max-h-64 overflow-y-auto">
            {/* Clear header above company list */}
            {filteredCompanies.length > 0 && (
              <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700">
                {filteredCompanies.length === 1
                  ? "Your company"
                  : `${filteredCompanies.length} companies available`}
              </div>
            )}

            <style jsx>{`
              .company-scroll::-webkit-scrollbar {
                width: 6px;
              }
              .company-scroll::-webkit-scrollbar-track {
                background: transparent;
              }
              .company-scroll::-webkit-scrollbar-thumb {
                background: rgba(156, 163, 175, 0.5);
                border-radius: 3px;
              }
              .company-scroll::-webkit-scrollbar-thumb:hover {
                background: rgba(156, 163, 175, 0.7);
              }
            `}</style>
            <div className="company-scroll py-1">
              {filteredCompanies.length > 0 ? (
                <div className="px-1 space-y-1">
                  {filteredCompanies.map(company => (
                    <button
                      key={company.id}
                      onClick={() => handleCompanySelect(company.id)}
                      className={`w-full flex items-center px-3 py-2.5 text-sm rounded-md transition-colors group min-w-0 ${
                        company.id === currentCompanyId
                          ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                      }`}
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <Building2
                          size={16}
                          className="mr-3 flex-shrink-0 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200"
                        />
                        <span
                          className="truncate font-medium min-w-0 flex-1 text-left"
                          title={company.name}
                        >
                          {company.name}
                        </span>
                      </div>
                      {company.id === currentCompanyId && (
                        <Check
                          size={16}
                          className="text-red-600 dark:text-red-400 flex-shrink-0 ml-2"
                        />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400 text-center">
                  {searchQuery ? (
                    <>
                      <Building2 size={24} className="mx-auto mb-2 opacity-50" />
                      <p>No companies found</p>
                      <p className="text-xs">Try adjusting your search</p>
                    </>
                  ) : (
                    <>
                      <Building2 size={24} className="mx-auto mb-2 opacity-50" />
                      <p>No companies available</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Empty state with create action */}
          {companies.length === 0 && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
              <div className="text-center">
                <button
                  onClick={() => {
                    onCreateCompany();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-red hover:bg-red-700 rounded-md transition-colors"
                >
                  <Plus size={16} className="mr-2" />
                  Create Your First Company
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
