// Next.js optimized Link component for client-side navigation
import Link from "next/link";
// Lucide React icons for mobile navigation interface
// LayoutDashboardIcon: Dashboard navigation
// Boxes: Product list navigation
// SettingsIcon: Account settings and company settings
// HelpCircle: Support and help section
// Plus: Create new company action
// Users: User management functionality
// Share2: Data sharing configuration
import { LayoutDashboardIcon, Boxes, SettingsIcon, HelpCircle, Plus, Users, Share2 } from "lucide-react";
// Theme selection component for light/dark mode switching in mobile view
import ThemeSelector from "../ui/ThemeSelector";

// Company data structure for mobile company selector
// Simplified interface matching desktop version for consistency
interface Company {
  id: string;      // Unique company identifier for selection and API calls
  name: string;    // Display name for company dropdown options
}

// Mobile navigation menu props interface
// Handles mobile-specific navigation patterns and touch interactions
// Designed for collapsible full-screen overlay navigation on small devices
interface MobileMenuProps {
  // Menu state and visibility control
  // Controls whether mobile menu overlay is visible
  isOpen: boolean;
  // Determines authenticated vs. public navigation options    
  isAuthenticated: boolean;
  // Prevents hydration mismatch during SSR/client transition  
  mounted: boolean;             
  
  // Company context for multi-tenant mobile experience
  // Currently selected company, null when no selection
  companyId: string | null;
  // Available companies for mobile dropdown selector    
  allCompanies: Company[];      
  
  // Navigation and state management utilities
  // Route matching for active navigation styling
  isActive: (path: string) => boolean;  
  
  // Mobile menu interaction handlers
  // Closes mobile menu overlay (called after navigation)
  onClose: () => void;                  
  
  // Company management actions optimized for mobile interaction
  // Handles company switching via dropdown
  onCompanySelect: (companyId: string) => void;
  // Navigates to company creation flow
  onCreateCompany: () => void;
  // Opens company configuration                
  onCompanySettings: () => void;
  // User management for current company                 
  onManageUsers: () => void;
  // Data sharing configuration         
  onDataSharing: () => void;                     
  
  // Authentication and navigation
  // User logout with cleanup
  onLogout: () => void;
  // Custom navigation with tour support                         
  onNavigation: (path: string, tourAction?: string) => void;  
}

// Mobile navigation component for responsive design
// Renders as full-width overlay menu that slides down from navbar on mobile devices
// Handles touch-friendly interactions and vertical scrolling navigation pattern
// Hidden on desktop (md breakpoint and above) where NavbarDesktop takes precedence
export default function NavbarMobile({
  isOpen,
  isAuthenticated,
  mounted,
  companyId,
  allCompanies,
  isActive,
  onClose,
  onCompanySelect,
  onCreateCompany,
  onCompanySettings,
  onManageUsers,
  onDataSharing,
  onLogout,
  onNavigation,
}: MobileMenuProps) {
  // Early return for performance optimization when menu is closed
  // Prevents unnecessary DOM rendering and improves mobile performance
  // Component completely unmounts when not needed, reducing memory usage
  if (!isOpen) return null;

  // Mobile menu overlay container
  // Hidden on desktop (md:hidden) and uses full width for mobile-first design
  // Includes proper theming support and border separation from main navbar
  return (
    <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      {/* Main navigation container with mobile-optimized spacing */}
      <div className="pt-2 pb-3 space-y-1">
        {isAuthenticated && mounted ? (
          <>
            {companyId && (
              <>
                <button
                  onClick={() => {
                    // Navigate with tour support
                    onNavigation("/dashboard", "navigate-to-dashboard"); 
                    // Close menu after navigation
                    onClose();                                           
                  }}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium min-h-[44px] w-full text-left
                    ${isActive("/dashboard") ? "bg-red text-white" : "text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"}`}
                >
                  <LayoutDashboardIcon size={16} className="mr-2" aria-hidden="true" />
                  Dashboard
                </button>

                <button
                  onClick={() => {
                    onNavigation("/product-list", "navigate-to-products");
                    onClose();
                  }}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium min-h-[44px] w-full text-left
                    ${isActive("/product-list") ? "bg-red text-white" : "text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"}`}
                >
                  <Boxes size={16} className="mr-2" aria-hidden="true" />
                  Products
                </button>
              </>
            )}

            {/* Mobile Company Selection */}
            <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Current Company:</p>
              <select
                value={companyId || ""}
                onChange={e => {
                  if (e.target.value) {
                    onCompanySelect(e.target.value);
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Company</option>
                {allCompanies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>

              {/* Mobile company actions */}
              <div className="mt-3 space-y-1">
                <button
                  onClick={() => {
                    onCreateCompany();
                    onClose();
                  }}
                  className="flex items-center justify-between w-full text-sm text-green-600 hover:text-green-900 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <div className="flex items-center">
                    <Plus size={14} className="mr-1" aria-hidden="true" />
                    Create New Company
                  </div>
                  <span className="text-xs text-gray-400" aria-label="Keyboard shortcut">
                    N
                  </span>
                </button>

                {companyId && (
                  <>
                    <button
                      onClick={() => {
                        onCompanySettings();
                        onClose();
                      }}
                      className="flex items-center text-sm text-gray-600 hover:text-gray-900 py-1 w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <SettingsIcon size={14} className="mr-2" aria-hidden="true" />
                      Company Settings
                    </button>
                    <button
                      onClick={() => {
                        onManageUsers();
                        onClose();
                      }}
                      className="flex items-center text-sm text-gray-600 hover:text-gray-900 py-1 w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <Users size={14} className="mr-2" aria-hidden="true" />
                      Manage Users
                    </button>
                    <button
                      onClick={() => {
                        onDataSharing();
                        onClose();
                      }}
                      className="flex items-center text-sm text-gray-600 hover:text-gray-900 py-1 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <Share2 size={14} className="mr-2" aria-hidden="true" />
                      Data Sharing
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile profile menu */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
              <Link
                href="/account"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 min-h-[44px]"
                onClick={onClose}
              >
                <SettingsIcon size={16} className="mr-2" aria-hidden="true" />
                Account Settings
              </Link>

              <Link
                href="/support"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 min-h-[44px]"
                onClick={onClose}
              >
                <HelpCircle size={16} className="mr-2" aria-hidden="true" />
                Support & Help
              </Link>

              <button
                onClick={onLogout}
                className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 min-h-[44px]"
              >
                Sign out
              </button>
            </div>

            {/* Mobile theme selection */}
            <div className="border-t border-gray-200 dark:border-gray-700 theme-selector">
              <ThemeSelector />
            </div>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 min-h-[44px]"
              onClick={onClose}
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 min-h-[44px]"
              onClick={onClose}
            >
              Register
            </Link>

            {/* Mobile theme selection for non-authenticated users */}
            <div className="border-t border-gray-200 dark:border-gray-700 theme-selector">
              <ThemeSelector />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
