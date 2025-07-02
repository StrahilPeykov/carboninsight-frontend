"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { LayoutDashboardIcon, Boxes, SettingsIcon, HelpCircle, ChevronDown } from "lucide-react";
import Button from "../ui/Button";
import ThemeSelector from "../ui/ThemeSelector";
import HelpMenu from "../HelpMenu";
import CleanCompanySelector from "./CompanySelector";

interface Company {
  id: string;
  name: string;
}

interface User {
  first_name?: string;
  last_name?: string;
  username: string;
  email: string;
}

interface DesktopNavProps {
  isAuthenticated: boolean;
  mounted: boolean;
  companyId: string | null;
  allCompanies: Company[];
  isCompanyMenuOpen: boolean;
  isProfileMenuOpen: boolean;
  user: User | null;
  isActive: (path: string) => boolean;
  onToggleCompanyMenu: () => void;
  onToggleProfileMenu: () => void;
  onCloseCompanyMenu: () => void;
  onCloseProfileMenu: () => void;
  onCompanySelect: (companyId: string) => void;
  onCreateCompany: () => void;
  onCompanySettings: () => void;
  onManageUsers: () => void;
  onDataSharing: () => void;
  onLogout: () => void;
  onNavigation: (path: string, tourAction?: string) => void;
  getUserDisplayName: () => string;
}

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
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
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

    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen, onCloseProfileMenu]);

  if (!isAuthenticated || !mounted) {
    return (
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
                  onCloseProfileMenu();
                  onLogout();
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
